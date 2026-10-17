import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./firebase"
import { UserComment } from "@/models/comment"

const COMMENTS_COLLECTION = "comments"
const STORAGE_KEY = "mfoliocal_comments_v1"

export { isFirebaseConfigured }

// Subscribe to real-time comments (Firestore or fallback to localStorage)
export function subscribeToComments(
  onUpdate: (comments: UserComment[], isLive: boolean) => void,
  onError?: (error: Error) => void
): () => void {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        orderBy("createdAt", "desc")
      )

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: UserComment[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data()
            let createdAtStr = new Date().toISOString()

            if (data.createdAt instanceof Timestamp) {
              createdAtStr = data.createdAt.toDate().toISOString()
            } else if (typeof data.createdAt === "string") {
              createdAtStr = data.createdAt
            }

            return {
              id: docSnap.id,
              name: data.name || "Anonymous",
              comment: data.comment || "",
              referralSource: data.referralSource || undefined,
              createdAt: createdAtStr,
            }
          })

          onUpdate(items, true)
        },
        (err) => {
          console.error("Firestore comment subscription error:", err)
          if (onError) onError(err)
          // Fallback to local storage if network or permissions fail
          loadLocalComments(onUpdate)
        }
      )

      return unsubscribe
    } catch (err) {
      console.warn("Falling back to local comments storage:", err)
      loadLocalComments(onUpdate)
      return () => {}
    }
  }

  // Fallback: LocalStorage / Demo Mode
  loadLocalComments(onUpdate)
  return () => {}
}

function loadLocalComments(
  onUpdate: (comments: UserComment[], isLive: boolean) => void
) {
  if (typeof window === "undefined") {
    onUpdate([], false)
    return
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed, false)
        return
      }
    }
  } catch (e) {
    console.warn("Could not read local comments:", e)
  }
  onUpdate([], false)
}

// Add a new comment
export async function addComment(
  newCommentData: Omit<UserComment, "id" | "createdAt">
): Promise<UserComment> {
  const isCloud = isFirebaseConfigured() && db !== null

  if (isCloud && db) {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      name: newCommentData.name,
      comment: newCommentData.comment,
      referralSource: newCommentData.referralSource || null,
      createdAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      name: newCommentData.name,
      comment: newCommentData.comment,
      referralSource: newCommentData.referralSource,
      createdAt: new Date().toISOString(),
    }
  }

  // Local storage fallback
  const localComment: UserComment = {
    ...newCommentData,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(STORAGE_KEY)
      const currentList: UserComment[] = existing ? JSON.parse(existing) : []
      const updated = [localComment, ...currentList]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  }

  return localComment
}

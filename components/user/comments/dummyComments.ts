import { UserComment } from "@/models/comment";

export const INITIAL_DUMMY_COMMENTS: UserComment[] = [
  {
    id: "comment-1",
    name: "Arun Sharma",
    comment:
      "Really love how fast the SIP comparison table loads! Being able to see rolling returns alongside CAGR has made evaluating fund performance so much clearer.",
    referralSource: "LinkedIn",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 minutes ago
  },
  {
    id: "comment-2",
    name: "Priya Nair",
    comment:
      "Clean UI and no unnecessary clutter. It would be awesome if we could also download the calculated SIP cashflows as a CSV in a future update!",
    referralSource: "Twitter / X",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
  },
  {
    id: "comment-3",
    name: "Vikram Mehta",
    comment:
      "Discovered this while looking for an accurate mutual fund portfolio returns calculator. The interactive charts make comparing different equity funds effortless.",
    referralSource: "Reddit / Finance Forum",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 1 day ago
  },
  {
    id: "comment-4",
    name: "Sneha Patel",
    comment:
      "Super responsive and modern interface. Shared this with my investor friends. Great work!",
    referralSource: "Friend or Colleague",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

const user = {
  userId: "1",
  username: "Dror",
  email: "dror@domain.com",
  role: "tutor", // Example role, adjust as necessary
  userDetails: {
    subjects: ["Math", "Physics", "Chemistry","Biology"],
    typeRole: "above80",
    posts: [
      {
        id: "1",
        title: "Post Title",
        description: "Post Description",
        subject: "Math",
        location: "Location",
        price: "Price",
        date: "Date",
      },
    ],
    requests: [
      {
        id: "1",
        title: "Looking for a tutor!",
        description: "Request Description",
        subject: "Math",
        location: "Location",
        price: "Price",
        date: "Date",
      },
    ],
  },
};

export default user;

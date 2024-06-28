export const userStudent = {
  userId: "1",
  username: "Omer",
  email: "omer@gmail.com",
  role: "student", // Example role, adjust as necessary
  userDetails: {
    subjects: ["Math", "Physics", "Chemistry","Biology"],
    typeRole: "Reserved",
    posts: [
      {
        id: "1",
        title: "Post Title",
        subject: "Math",
        description: "Post Description",
      },
    ],
    requests: [
    ],
  },
};

export const userTutor = {
  userId: "2",
  username: "Dor",
  email: "dor@gmail.com",
  role: "tutor", // Example role, adjust as necessary
  userDetails: {
    subjects: ["Math", "Physics","Biology"],
    typeRole: "Reserved",
    posts: [
      {
        id: "1",
        title: "Post Title",
        subject: "Math",
        description: "Post Description",
      },
      {
        id: "2",
        title: "Post Title",
        subject: "Physics",
        description: "Post Description",
      },
      {
        id: "3",
        title: "Post Title",
        subject: "Biology",
        description: "Post Description",
      }
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
      {
        id: "2",
        title: "Looking for a tutor!",
        description: "Request Description",
        subject: "Physics",
        location: "Location",
        price: "Price",
        date: "Date",
      },
      {
        id: "3",
        title: "Looking for a tutor!",
        description: "Request Description",
        subject: "Chemistry",
        location: "Location",
        price: "Price",
        date: "Date",
      }, 
      {
        id: "4",
        title: "Looking for a tutor!",
        description: "Request Description",
        subject: "Biology",
        location: "Location",
        price: "Price",
        date: "Date",
      },
    ],
  },
};

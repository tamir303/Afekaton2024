import React from "react";
import { PrettyChatWindow } from "react-chat-engine-pretty";

/**
 * ChatsPage component for displaying a chat window.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.user - The user object containing username and secret.
 * @returns {JSX.Element} The rendered ChatsPage component.
 */
const ChatsPage = (props) => {
  const { email, username } = props.user;
  const [first_name, last_name] = username.split(" ");
//           alert(`YOin chat, ${email}`);

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
      <h2 style={{ marginBottom: "10px" }}>Welcome: {first_name} { last_name }</h2> {/* Display the username with smaller font size */}
      <div style={{ height: "95%", width: "100%" }}>
        <PrettyChatWindow
          projectId={process.env.REACT_APP_CHAT_ENGINE_PROJECT_ID}
            username={email}
            secret={email}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default ChatsPage;

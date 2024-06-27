import { useState, useEffect  } from "react";
//import { useState } from "react";
import axios from './axiosConfig';
//import axios from "axios";

/**
 * AuthPage component for handling user authentication.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onAuth - The callback function to be called after authentication.
 * @returns {JSX.Element} The rendered AuthPage component.
 */
const AuthPage = (props) => {
    const [superapp, setSuperapp] = useState();
//    const [emailLogin, setEmailLogin] = useState();
    const [email, setEmail] = useState();
    const [role, setRole] = useState();
    const [first_name, setFirstName] = useState();
    const [last_name, setLastName] = useState();
    const [avatar, setAvatar] = useState();
//    const [username, setUsername] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const [superAppObjectID, setsuperAppObjectID] = useState();

      // Triggered when the page loads
    useEffect(() => {
        // Perform any initial actions or fetch data here
        // This code will run only once when the page loads
//        alert(`Page loaded ${process.env.REACT_APP_SUPER_USER_EXAMPLE_EMAIL}`);
        doCreateSuperAppUserAndGetEmail();
        doGetSuperAppObjectId()
    }, []);

    const doCreateSuperAppUserAndGetEmail = async (e) => {
        const newSuperAppUser = { //what it sends to back (user boundary)
            email: process.env.REACT_APP_SUPER_USER_EXAMPLE_EMAIL,
            role: "SUPERAPP_USER",
            username: "diddlysuper doodlyking",
            avatar: "picimgpic",
        };
        await axios
        .post("/superapp/users", newSuperAppUser)
        .then(async (r) => doGetSuperAppObjectId())
//        .catch((e) => );
    };
    // Function to create a new object
    const doGetSuperAppObjectId = async (e) => {
        // Construct the new object data
        const newObject = {
        type: "ChatObjectInit",
        alias: "ChatInitialInit",
        active: true,
        creationTimestamp: new Date().toISOString(),
        location: {
            "lat": 32.1133, //TODO get current location
            "lng": 34.818
        },
        createdBy: {
            userId: {
                superapp: process.env.REACT_APP_SUPER_APP_NAME_KEY,
                email: process.env.REACT_APP_SUPER_USER_EXAMPLE_EMAIL
            }
        },
        objectDetails: {
            key1: "have fun"
        }
    };
    // Send the POST request to create the object
    await axios
        .post("/superapp/objects", newObject)
        .then((response) => {
            // Handle the successful creation of the object
            console.log("Object created:", response.data);
            const internalObjectId = response.data.objectId.internalObjectId;
//            alert(`hey : ${internalObjectId}`)
            // Set the internalObjectId to the superAppObjectID state variable
            setsuperAppObjectID(internalObjectId);
        })
        .catch((e) => {
            // Handle the error in creating the object
            console.log("Error creating object:", e);
            alert("Error creating object");
        });
    };

/**
   * Handles the login form submission.
   *
   * @param {Object} e - The event object.
   */
    const onLogin = (e) => {
//            alert(`YOin login, ${email}`);
//            alert(`YOin login, ${superapp}`);
        e.preventDefault();
        axios
        .get(`/superapp/users/login/${superapp}/${email}`)
        .then((r) => {props.onAuth({ ...r.data, email })}) // NOTE: over-ride email
        .catch((e) => console.log(JSON.stringify(e.response.data)));
    };

    const doFunction2 = (e) => {
//        alert(`${process.env.REACT_APP_CHAT_ENGINE_PROJECT_ID}`);
//        alert(`${process.env.REACT_APP_SUPER_APP_NAME_KEY}`);
        e.preventDefault();
        const miniAppCommand = { //what it sends to back (user boundary)
        command: "activateChatLogin",
        targetObject: {
            objectId: {
                superapp: process.env.REACT_APP_SUPER_APP_NAME_KEY, //"2023b.dor.ferenc", //TODO get out of hard coded
                internalObjectId: superAppObjectID //process.env.REACT_APP_VALID_OBJECT_ID //TODO get out of hard coded a valid OBJECTID
            }
        },
        invocationTimestamp: new Date().toISOString(),
        invokedBy: {
            userId: {
                superapp: superapp,
                email: email
            }
        },
        commandAttributes: {
          key1: {
            key1subkey: ""
          }
        }
        };
        axios
        .post("/superapp/miniapp/Chat", miniAppCommand)
        .then((r) => {console.log(r.data); onLogin(e);})  //what is returned is r
        .catch((e) => { console.log(JSON.stringify(e.response.data));
        //        setErrorMessage("HEY An error occurred. Please try again later");
        alert('LOGIN: An error occurred. Please check ROLE and try again later.'); })
    };

    /**
   * Handles the sign-up form submission.
   *
   * @param {Object} e - The event object.
   */
    const onSignup = async (e) => {
        e.preventDefault();
        const newUser = { //what it sends to back (user boundary)
            email: email,
            role: role,
            username: `${first_name} ${last_name}`,
            avatar: avatar,
        };
          await axios
            .post("/superapp/users", newUser)
            .then(async (r) => {
//              alert(`finished signup`);
              const success = doFunction3(e);
//              alert(`SIGNUP: didDofunction3 work? ${success}`);

              if (role === "MINIAPP_USER" && success) {
                props.onAuth({ ...r.data, email });
              } else {
                setErrorMessage("GREAT, now please LOGIN");
              }
            })
            .catch((e) => console.log(JSON.stringify(e.response.data)));
        };
//        axios
//        .post("http://localhost:8083/superapp/users", newUser)
//        .then((r) => {
//
//            //Turned off new user can enter login page after sign up
//            const shit = doFunction3(e);
//            alert(`SIGNUP: An error occurred. Please try again later. ${shit}`);
//            if (role == "MINIAPP_USER" && shit == true) {
//                props.onAuth({ ...r.data, email });
//            }
//            else {
//                setErrorMessage("GREAT now please LOGIN");//what is returned is r
//            }
//    //        const { email, username } = r.data;
//    //        const [first_name, last_name] = username.split(" ");
//    //        props.onAuth({ ...r.data, email, first_name, last_name }); //send to next page this data
//        })
//        .catch((e) => console.log(JSON.stringify(e.response.data)));
//    };

//    const doFunction3 = (e) => {
    const doFunction3 = async (e) => {
        e.preventDefault();
        const miniAppCommand = { //what it sends to back (user boundary)
            command: "activateChatSignUp",
            targetObject: {
                objectId: {
                    superapp: process.env.REACT_APP_SUPER_APP_NAME_KEY,
                    internalObjectId: superAppObjectID // process.env.REACT_APP_VALID_OBJECT_ID //TODO get out of hard coded a valid OBJECTID
                }
            },
            invocationTimestamp: new Date().toISOString(),
            invokedBy: {
                userId: {
                    superapp: process.env.REACT_APP_SUPER_APP_NAME_KEY,
                    email: email
                }
            },
            commandAttributes: {
                firstName: first_name,
                lastName : last_name
            }
        };

//        try {
//            alert(`email: ${email}`);
            const response = await axios.post("/superapp/miniapp/Chat", miniAppCommand);
            response.then((r) => { alert("GOOD"); return true });
            response.catch((e) => { alert("BAD"); return false });
//        } catch (error) {
//            alert('BAD2.');
//            return false;
//        }
//        axios
//        .post("http://localhost:8083/superapp/miniapp/Chat", miniAppCommand)
//        .then((r) => {
//            console.log(r.data);
//            return true;
////            onSignup(e);
//        })  //what is returned is r
//        .catch((e) => {
//        //        setErrorMessage("HEY An error occurred. Please try again later");
//            alert('SINGUP: An error occurred. Please try again later.');
//            return false;
//        });
      };

    return (
        <div className="login-page">
            <div className="card">
                    {/* Login Form */}
                <form onSubmit={(e) => {
                    e.preventDefault();
                    doFunction2(e)
                        //          setTimeout(() => onLogin(e), 2000);
                    }}>


                    <div className="title">Apart Mate - Chat</div>
                    <div className="title">{errorMessage && <div>{errorMessage}</div>} </div>
                    <div className="title">Login</div>
                    <input
                        type="text"
                        name="email"
                        placeholder="Superapp"
                        onChange={(e) => setSuperapp(e.target.value)}
                    />
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">LOG IN</button>
                </form>

                {/* Sign Up Form */}
                <form onSubmit={(e) => {
                    onSignup(e);
                    }}>
                    <div className="title">or Sign Up</div>

                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        name="role"
                        placeholder="Role"
                        onChange={(e) => setRole(e.target.value)}
                    />
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First name"
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last name"
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                        type="text"
                        name="avatar"
                        placeholder="avatar"
                        onChange={(e) => setAvatar(e.target.value)}
                    />
                    <button type="submit">SIGN UP</button>
                </form>
            </div>

            <style>{`
                .login-page { width: 100vw; height: 100vh; padding-top: 6vw; background: linear-gradient(180deg, rgba(117,84,160,1) 7%, rgba(117,84,160,1) 17%, rgba(106,95,168,1) 29%, rgba(99,103,174,1) 44%, rgba(87,116,184,1) 66%, rgba(70,135,198,1) 83%, rgba(44,163,219,1) 96%, rgba(22,188,237,1) 100%, rgba(0,212,255,1) 100%); }
                .card { width: 200px; position: relative; left: calc(50vw - 100px); text-align: center; }
                .title { padding-top: 32px; font-size: 22px; color: white; font-weight: 700; }
                input { width: calc(100% - 16px); margin-top: 12px; padding: 8px; background-color: #e6f7ff; outline: none; border: 1px solid #e6f7ff; }
                button { margin-top: 12px; width: 100%; padding: 8px; }
            `}</style>
        </div>
    );
};

export default AuthPage;



////          <input
  //            type="text"
  //            name="superapp"
  //            placeholder="Superapp"
  //            onChange={(e) => setSuperapp(e.target.value)}
  //          />


//
//       // Function to create a new object
//        const doCreateObject = (e) => {
//          // Construct the new object data
//          const newObject = {
//            objectId: {
//              superapp: "2023b.dor.ferenc",
//              internalObjectId: ""
//            },
//            type: "Chat",
//            alias: "ChatLogIn",
//            active: true,
//            creationTimestamp: new Date().toISOString(),
//            location: {
//              "lat": 32.1133, //TODO get current location
//              "lng": 34.818
//            },
//            createdBy: {
//              userId: {
//                superapp: "2023b.dor.ferenc",
//                email: "superKING@demo.com"
//              }
//            },
//            objectDetails: {
//              // Specify the object details
//              key1: "can be set to any value you wish",
//                  key2: "you can also name the attributes any name you like",
//                  key3: 9.99,
//                 key4: true
//            }
//          };
//
//          // Send the POST request to create the object
//          alert("Page loaded2");
//          axios
//            .post("http://localhost:8083/superapp/objects", newObject)
//            .then((response) => {
//              // Handle the successful creation of the object
//              console.log("Object created:", response.data);
//            })
//            .catch((e) => {
//              // Handle the error in creating the object
//              console.log("Error creating object:", e);
//              alert("Error creating object");
//            });
//            alert("Page loaded3");
//        };
import React, { useState } from 'react';

const avatars = [
    "https://semantic-ui.com/images/avatar2/small/patrick.png",
    "https://semantic-ui.com/images/avatar2/small/kristy.png",
    "https://semantic-ui.com/images/avatar2/small/mark.png",
    "https://semantic-ui.com/images/avatar2/small/matthew.png",
    "https://semantic-ui.com/images/avatar2/small/elyse.png",
    "https://semantic-ui.com/images/avatar2/small/lindsay.png",
];

// const avatars = [
//     {
//         id: 1,
//         url: "https://semantic-ui.com/images/avatar2/small/patrick.png",
//     },
//     {
//         id: 2,
//         url: "https://semantic-ui.com/images/avatar2/small/kristy.png",
//     },
//     {
//         id: 3,
//         url: "https://semantic-ui.com/images/avatar2/small/mark.png",
//     },
//     {
//         id: 4,
//         url: "https://semantic-ui.com/images/avatar2/small/matthew.png",
//     },
//     {
//         id: 5,
//         url: "https://semantic-ui.com/images/avatar2/small/elyse.png",
//     },
//     {
//         id: 6,
//         url: "https://semantic-ui.com/images/avatar2/small/lindsay.png",
//     },
// ];


function Login({ logIn }) {

    const [screenname, setScreenname] = useState("");
    const [avatar, setAvatar] = useState("https://semantic-ui.com/images/avatar2/small/patrick.png");

    return (
        <div className="chat_login">
            
            <div className="logo_text">
                <span>Chit</span> <span className="colored">Chat</span>
            </div>

            <div className="avatar_list">  
                {
                    avatars.map((avt, idx) => (
                        <div className={avatar === avt ? "avatar active_avatar" : "avatar"} key={idx}>
                            <img 
                                src={avt} 
                                className="avatar_image" 
                                alt=""
                                onClick={() => setAvatar(avt)} />
                        </div>
                    ))
                }

            </div>

            <div className="screenname_input_holder">
                <input type="text" value={screenname} placeholder="Enter Name" className="screenname_input" onChange={(e) => setScreenname(e.target.value)} />
            </div>

            <div className="btn_holder">
                <button className="enter_chat_btn" onClick={() => logIn({ screenname, avatar })}>ENTER CHAT</button>
            </div>

        </div>
    );
}

export default Login;
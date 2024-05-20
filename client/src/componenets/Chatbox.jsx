import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import { useParams } from "react-router-dom";

function Chatbox({socketRef,onMssgChange}) {
  const messagesEndRef=useRef(null);
  const { username, roomId } = useParams();
  const [mssg, setMssg] = useState([]);
  const [input,setInput]=useState("");

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("mssg", (data) => {
        // console.log(data);
        setMssg((prev) => [...prev, data]);
      });
      // this will  get listened one time wehn new user will enter the room
      socketRef.current.on("all-mssg",(data)=>{
        // console.log(data);
        setMssg(data);
      })
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("mssg");
        socketRef.current.off("all-mssg");
      }
    };
  }, [socketRef.current]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mssg]);

  const sendMssg= () => {
    if(input.trim()==="")return;
    onMssgChange([...mssg,{user: username, mssg: input}]);
    setMssg((prev) => [...prev, { user: username, mssg: input }]);
    socketRef.current.emit("mssg", { user:username, mssg: input, roomId });
    setInput("");
  }

const handleKeyDown=(event)=>{
  if (event.key === 'Enter') {
    sendMssg();
  }
}
  return (
    <div className="w-3/12   bg-zinc-800 ml-3 h-screen overflow-hidden">
      <div  className="overflow-y-auto" style={{ height: "90%", width: "100%" }}>
        {mssg.map(({ user, mssg }, index) => {
          return user === username ? (
            <MyMssg key={index} user={user} mssg={mssg} />
          ) : (
            <OtherMssg key={index} user={user} mssg={mssg} />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="" style={{ height: "10%", width: "100%" }}>
        <input
          placeholder=" Message"
          onChange={(e)=>setInput(e.target.value)}
          value={input}
          className="border-white border-2 my-2 mx-2 bg-gray-700 text-slate-50 p-1 text-sm  rounded-xl"
          style={{ height: "50px", width: "80%" }}onKeyDown={handleKeyDown}
        ></input>
        <button style={{heigth:"50px",width:"10%"}}onClick={sendMssg} className="bg-green-500 p-1 rounded-xl text-zinc-950 text-xs hover:text-pink-600 hover:bg-white font-medium">
          send
        </button>
      </div>
    </div>
  );
}

function MyMssg({ user, mssg }) {
  return (
    <div
      style={{ width: "fit-content", maxWidth: "250px", marginLeft: "auto" }}
      className="break-words text-slate-50 text-xs bg-emerald-600 p-2 my-2 mr-2 rounded-md"
    >
      {mssg}
    </div>
  );
}


function OtherMssg({ user, mssg }) {
  return (
    <div
      style={{ width: "fit-content", maxWidth: "250px" }}
      className="  bg-gray-700 ml-2 my-2 rounded-md"
    >
      <div className="items-center pl-2 pt-1">
        <Avatar name={user} size={30} round="20px" className="" />
        <span className="text-sm font-medium text-pink-600 ml-1 mr-2">{user}</span>
      </div>
      <div className=" break-words  text-slate-50 text-xs p-2">{mssg}</div>
    </div>
  );
}

export default Chatbox;

import Chatbox from "../componenets/Chatbox";
import Client from "../componenets/Client";
import CodeEditor from "../componenets/CodeEditor";
import { toast, Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { initSocket } from "../../socket";



function EditorPage() {
    const socketRef = useRef(null);
    const codeRef=useRef(null);
    const mssgRef=useRef(null);
    const langRef=useRef(null);
    const inputRef=useRef(null);
    const outputRef=useRef(null);
  const { username, roomId } = useParams();
  const [client, setClient] = useState([]);
  const navigate = useNavigate();
  

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        navigate("/");
        alert("Socket connection failed, try again later after 1 min");
      }

      socketRef.current.emit("join", { roomId, username });

      socketRef.current.on("joined", ({ user, clients, socketId }) => {
        if (user !== username) {
          console.log('here');
          toast.success(`${user} just joined the room`);
        }
        setClient(clients);

        
        if (codeRef.current) {
            socketRef.current.emit("sync-code", { code: codeRef.current, socketId });
          }
          if(mssgRef.current){
            socketRef.current.emit("sync-mssg",{allMssg:mssgRef.current,socketId})
          }
          if (langRef.current) {
            socketRef.current.emit("sync-lang", { langInd: langRef.current, socketId });
          }

          if (inputRef.current) {
            socketRef.current.emit("sync-input", { inp: inputRef.current, socketId });
          }

          if (outputRef.current) {
            socketRef.current.emit("sync-output", { out: outputRef.current, socketId });
          }
      });

      socketRef.current.on("disconnected", ({ socketId, user }) => {
        toast.success(`${user} left the room`);
        setClient((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("connect_error");
        socketRef.current.off("connect_failed");
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
      }
    };
  }, []);

  async function copyRoomId(){
    try{
        await navigator.clipboard.writeText(roomId);
        toast.success("room id copied");
    }
    catch(e){
        toast.error('something went wrong try again')
        console.log('copy room id error',e);
    }
  }
  function leaveRoom(){
    navigate('/');
  }
  return (
    
      <div className="flex flex-row  w-screen h-screen">
        <div className="w-2/12 bg-neutral-800 h-screen">
          <Toaster />
          <img
            src="../../codecast.png"
            alt="codecast"
            className="w-30 h-25 -mt-12"
          />
          <hr className="text-white -mt-12 mx-2 mb-3" />

          <div className="h-3/5 overflow-auto">
            {client.map(({ username, socketId }) => (
              <Client key={socketId} username={username} />
            ))}
          </div>
          <hr className="text-white mx-2 mt-3" />

          <div className="text-center mx-3">
            <button onClick={copyRoomId}className="my-3 rounded-lg px-4 py-2 bg-green-700 text-green-100 hover:bg-green-800 duration-300">
              Copy Room Id
            </button>
            <br />
            <button onClick={leaveRoom} className="rounded-lg px-4 py-2 bg-red-600 text-red-100 hover:bg-red-700 duration-300">
              Leave Room
            </button>
          </div>
        </div>
      <CodeEditor socketRef={socketRef} onCodeChange={(code)=>{codeRef.current=code}} onLangChange={(langInd)=>{langRef.current=langInd}} onInputChange={(inp)=>{inputRef.current=inp}} onOutputChange={(out)=>{outputRef.current=out}}></CodeEditor>
      <Chatbox socketRef={socketRef} onMssgChange={(data)=>{mssgRef.current=data}}></Chatbox>
      </div>
    
  );
}

export default EditorPage;

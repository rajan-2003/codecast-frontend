import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate=useNavigate();
  function handleNewRoom() {
    setRoomId(uuidv4());
    // console.log(id);
    toast.success("room id created");
  }
  function handleJoin() {
    if (roomId.trim() === "" || username.trim() === "")
      toast.error("require both username and roomId");
    else {
      alert("please wait it might take some time to load")
      navigate(`/editor/${username.trim()}/${roomId.trim()}`)
    }
  }
  return (
    <div className="container-fluid ">
      <Toaster position="top-center"></Toaster>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-2 mb-5 bg-secondary rounded">
            <div className="card-body text-center bg-dark">
              <img
                className="img-fluid mx-auto d-block"
                src="../../codecast.png"
                alt="codecast"
                style={{ maxWidth: "150px" }}
              ></img>
              <h4 className="text-light mb-2">Enter your room Id</h4>
              <div className="form-group">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  type="text"
                  className="form-control mb-4"
                  placeholder="Room Id"
                ></input>
              </div>
              <div className="form-group">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  className="form-control mb-4"
                  placeholder="Username"
                ></input>
              </div>
              <button
                className="btn btn-success btn-lg btn-block"
                onClick={handleJoin}
              >
                Join
              </button>
              <p className="mt-3 text-light ">
                Don't have room Id ?{" "}
                <span
                  className="text-success p-2"
                  style={{ cursor: "pointer" }}
                  onClick={handleNewRoom}
                >
                  New Room
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

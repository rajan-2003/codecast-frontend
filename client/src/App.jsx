import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage></HomePage>}></Route>
          <Route path="/editor/:username/:roomId" element={<EditorPage></EditorPage>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

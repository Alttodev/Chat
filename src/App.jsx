import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <>
      <div className="text-green-400 flex justify-center items-center">
        chat app
      </div>
      <div className="flex justify-center items-center">
        <Button className="bg-emerald-600 hover:bg-emerald-600 text-white cursor-pointer">
          Click me
        </Button>
      </div>
    </>
  );
}

export default App;

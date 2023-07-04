import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [sysInfo, setSysInfo] = useState<any>()

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

    invoke("calculate_mem").then(mem => {
      console.log(mem);
      setSysInfo(JSON.parse(mem as string))
    })
    setGreetMsg(await invoke("greet", { name }));
  }



  useEffect(() => {

    console.log("tawanda");

    setInterval(() => {
      invoke("calculate_mem").then(mem => {
        console.log(JSON.parse(mem as string));
        setSysInfo(JSON.parse(mem as string))
      })
    }, 2000)


  }, [])

  return (
    <div className="container">

      <h3>CPU Load AVG: { (Number(sysInfo?.cpu_load_avg) * 100.0).toFixed(1) }</h3>

      {sysInfo?.cpu_load?.map((load?: number, index?: number) => {
        return (
          <p key={Math.random()}>Cpu {index}: {(Number(load) * 100.0).toFixed(1)}%</p>
        )
      })}

      <h3>Mem usage:</h3>
      <p>Free: {sysInfo?.mem?.free} </p>
      <p>Usage: {sysInfo?.mem?.usage} / {sysInfo?.mem?.total}</p>

    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";

import { emit, listen } from '@tauri-apps/api/event'
import  "./style.css"


function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [sysInfo, setSysInfo] = useState<any>()
  const [sysInfoV2, setSystInfoV2] = useState<any>();

  useEffect(() => {
    listen("system-stats", (e) => {
      console.log(e);
      setSystInfoV2(e.payload)
    })
  })

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

    invoke("calculate_mem").then(mem => {
      console.log(mem);
      setSysInfo(JSON.parse(mem as string))
    })
    setGreetMsg(await invoke("greet", { name }));
  }

  useEffect(() => {
    invoke("init_process").then(sysInfo => {
      console.log(sysInfo);
    })
  }, [])



  useEffect(() => {

    console.log("tawanda");

    setInterval(() => {
      invoke("calculate_mem").then(mem => {

        setSysInfo(JSON.parse(mem as string))
      })
    }, 2000)


  }, [])

  return (
    <div className="container">

      <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
        <p className="text-3xl text-gray-700 font-bold mb-5">
          Welcome!
        </p>
        <p className="text-gray-500 text-lg">
          React and Tailwind CSS in action
        </p>
      </div>

      <h1 className="text-4xl text font-italic color font-bold underline text-center">Hello world!</h1>

      <h3>CPU Load AVG: {(Number(sysInfoV2?.cpus?.reduce((accumulator: any, currentValue: any) => accumulator + currentValue?.cpu_usage, 0)) / sysInfoV2?.cpus?.length).toFixed(1)}</h3>

      {sysInfoV2?.cpus?.map((load?: any, index?: number) => {
        return (
          <p key={load?.name} className="text-3xl font-bold underline">{load?.name}: {(Number(load?.cpu_usage)).toFixed(1)}%</p>
        )
      })}

      <h3>Mem usage:</h3>
      <p>Free: {sysInfo?.mem?.free} </p>
      <p>Usage: {sysInfo?.mem?.usage} / {sysInfo?.mem?.total}</p>

    </div>
  );
}

export default App;

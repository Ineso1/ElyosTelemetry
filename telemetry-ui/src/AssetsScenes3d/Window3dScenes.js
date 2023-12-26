import React from "react";
import { Canvas } from "@react-three/fiber";
import "./Window3dScenes.css";

const Window3dScenes = ({ cameraPos, children }) => {
  return (
    <Canvas camera={{ position: cameraPos }} gl={{ antialias: true }}>
      {children}
    </Canvas>
  );
};

export default Window3dScenes;
import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function GyroObj(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(
    "/Assets3d_obj/Gyro.glb"
  );
  return (
    <group ref={group} dispose={null}>
      <group name="Scene">
        <group
          name="Armature"
          rotation={[Math.PI / 2.2, 2.8, 0]}
          scale={100}
          position={[0, 0, -3.5]}
        >
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="unamed"
            geometry={nodes.unamed.geometry}
            material={materials.palettemat}
            skeleton={nodes.unamed.skeleton}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/animatedCharacters/animatedCharacter.glb");
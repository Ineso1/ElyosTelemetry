import React, {Suspense} from 'react'
import GyroObj from '../Assets3d/GyroObj';
import Window3dScenes from './Window3dScenes'
import { OrbitControls } from "@react-three/drei";
import "./GyroScene.css";

function GyroWindow() {
    return (
        <div className="Window3d">
          <Window3dScenes className="Window3dScene" cameraPos={[0, 0, -8]}>
            <Suspense fallback={null}>
              <GyroObj/>
            </Suspense>
            <OrbitControls
              autoRotate
              autoRotateSpeed={2}
              minDistance={7}
              maxDistance={9}
              enablePan={false}
            />
            <ambientLight intensity={0.7} />
            <pointLight color="orange" intensity={1} position={[10, 10, 20]} />
          </Window3dScenes>
        </div>
    );
}

export default GyroWindow
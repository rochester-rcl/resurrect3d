import React, {} from "react"
import {Canvas} from "@react-three/fiber"
import {Box, OrbitControls} from "@react-three/drei"
import * as THREE from "three"

function Skybox(texture){

    return(
        <mesh>
        <sphereBufferGeometry attach="geometry" args={[500, 60, 40]} />
        <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} />
      </mesh>
    )
}

function Mesh(props, mesh){

    return(
        <group>
            <mesh geometry={mesh.geometry}/>
            <meshStandardMaterial/>
        </group>
    )
}

function Scene(props, mesh, texture){

    return(
        <Canvas>
            <ambientLight color="white"/>
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

            <Box> 
                 <meshStandardMaterial attach="material" color="pink"/>
            </Box>
            <OrbitControls/>
        </Canvas>
    )
}
export default Scene
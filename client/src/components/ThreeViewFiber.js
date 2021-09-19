import React, {} from "react"
import {Canvas} from "@react-three/fiber"
import {Box, OrbitControls} from "@react-three/drei"
import * as THREE from "three"

function Skybox(props){
    console.log(props.tex);
    return(
        <mesh>
        <sphereBufferGeometry attach="geometry" args={[500, 60, 40]} />
        <meshBasicMaterial attach="material" map={props.tex} side={THREE.BackSide} />
      </mesh>
    )
}

function Mesh(props){
    var model = props.object.child[0];
    console.log(props.object);
    return(
        <group>
            <mesh geometry={model.geometry}/>
            <meshStandardMaterial />
        </group>
    )
}

function Scene(props){

    return(
        <Canvas>
            <ambientLight color="white"/>
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <Skybox tex={props.tex} object={props.object}/>
            <OrbitControls/>
        </Canvas>
    )
}
export default Scene
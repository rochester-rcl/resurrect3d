import React, {} from "react"
import {Canvas} from "@react-three/fiber"
import {} from "@react-three/drei"
import * as THREE from "three"

function Skybox(){
    const {texture} = this.props
    return(
        <mesh>
        <sphereBufferGeometry attach="geometry" args={[500, 60, 40]} />
        <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} />
      </mesh>
    )
}

function Mesh(){
    const {mesh} = this.props
    return(
        <group>
            <mesh geometry={mesh.geometry}/>
            <meshStandardMaterial/>
        </group>
    )
}

function Scene(){
    const {mesh, texture} = this.props
    return(
        <Canvas>
            <Skybox/>
            <Mesh/>
        </Canvas>
    )
}
export default Scene
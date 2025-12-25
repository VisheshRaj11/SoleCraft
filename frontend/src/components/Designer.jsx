import React, { useState, Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import axios from "axios";
import {
  useGLTF,
  OrbitControls,
  Stage,
  PerspectiveCamera,
  Html,
  useProgress,
} from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-64">
        <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mb-4">
          <div
            className="bg-white h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-white">
          Loading {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

function ShoeModel({ colors }) {
  const group = useRef();
  const { scene, materials } = useGLTF("/nikeShoes.glb");

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.y = Math.sin(t / 4) * 0.1;
    }
  });

  useEffect(() => {
    if (!materials) return;

    Object.entries(materials).forEach(([name, mat]) => {
      const lowerName = name.toLowerCase();
      let targetColor = null;

      if (lowerName.includes("logo")) {
        targetColor = colors.logo;
        mat.map = null;
      } else if (lowerName.includes("sole") || lowerName.includes("insole")) {
        targetColor = colors.sole;
      } else if (lowerName.includes("lace")) {
        targetColor = colors.laces;
      } else if (
        lowerName.includes("body") ||
        lowerName.includes("flap") ||
        lowerName.includes("tag")
      ) {
        targetColor = colors.body;
      }

      if (targetColor) {
        mat.color.set(targetColor);
        mat.needsUpdate = true;
      }
    });
  }, [colors, materials]);

  return (
    <group ref={group} scale={1.2} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

export default function ShoeConfigurator() {
  const [activePart, setActivePart] = useState("body");
  const [isSaving, setIsSaving] = useState(false);
  const glRef = useRef(null);

  const [shoeName, setShoeName] = useState("Nike Custom Air");
  const [price, setPrice] = useState(150);
  const [rating, setRating] = useState(4.5);

  const [colors, setColors] = useState({
    body: "#FFFFFF",
    sole: "#E60012",
    laces: "#1A1A1A",
    logo: "#1A1A1A",
  });

  useEffect(() => {
    const basePrice = 150;
    const customizations = Object.values(colors).filter((c) => c !== "#FFFFFF").length;
    setPrice(basePrice + customizations * 10);
    setRating((Math.random() * (5 - 4) + 4).toFixed(1));
  }, [colors]);

  const parts = [
    { id: "body", label: "Shoe Body" },
    { id: "sole", label: "Sole & Insole" },
    { id: "laces", label: "Shoelaces" },
    { id: "logo", label: "Nike Swoosh" },
  ];

  const updateColor = (newColor) => {
    setColors((prev) => ({ ...prev, [activePart]: newColor }));
  };

  const handleDownload = () => {
    if (!glRef.current) return;
    const canvas = glRef.current.domElement;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `custom-kicks-${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  const handleSaveDesign = async () => {
    if (!glRef.current) return;
    setIsSaving(true);
    try {
      const canvas = glRef.current.domElement;
      const imageData = canvas.toDataURL("image/png");
      const responseImg = await fetch(imageData);
      const blob = await responseImg.blob();
      const file = new File([blob], "custom-shoe.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("image", file);
      formData.append("name", shoeName);
      formData.append("price", price);
      formData.append("rating", rating);

      const res = await axios.post(
        "/api/custom/save-design",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Design successfully saved to backend!");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error connecting to server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-black overflow-hidden pt-18">
      {/* 3D Viewer Section */}
      <section className="w-full lg:w-2/3 h-[45vh] lg:h-full bg-[#111111]">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.setClearColor("#111111");
            glRef.current = gl;
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
          <Suspense fallback={<Loader />}>
            <Stage environment="city" intensity={0.6} contactShadow>
              <ShoeModel colors={colors} />
            </Stage>
          </Suspense>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </section>

      {/* Controls Section */}
      <section className="w-full lg:w-1/3 bg-neutral-900 h-[55vh] lg:h-full shadow-2xl flex flex-col border-l border-neutral-800">
        <div className="p-6 lg:p-10 overflow-y-auto flex-grow">
          <header className="mb-8">
            <input
              type="text"
              value={shoeName}
              onChange={(e) => setShoeName(e.target.value)}
              className="text-3xl font-black uppercase tracking-tight outline-none border-b-2 border-transparent focus:border-white w-full bg-transparent text-white"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xl font-bold text-neutral-400">${price}</p>
              <p className="text-sm font-bold text-yellow-500">⭐ {rating}</p>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {parts.map((part) => (
              <button
                key={part.id}
                onClick={() => setActivePart(part.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  activePart === part.id
                    ? "border-white bg-white text-black"
                    : "border-neutral-800 bg-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-neutral-600"
                  style={{ backgroundColor: colors[part.id] }}
                />
                <span className="text-[11px] font-bold uppercase tracking-tight">
                  {part.label}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-neutral-800 p-6 rounded-3xl border border-neutral-700">
            <input
              type="color"
              value={colors[activePart]}
              onChange={(e) => updateColor(e.target.value)}
              className="w-full h-16 rounded-2xl cursor-pointer border-4 border-neutral-900 shadow-sm mb-4"
            />
            <input
              type="text"
              value={colors[activePart].replace("#", "")}
              onChange={(e) => updateColor(`#${e.target.value}`)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm outline-none focus:border-white"
              maxLength={6}
            />
          </div>
        </div>

        <div className="p-6 border-t border-neutral-800 flex flex-col gap-3 bg-neutral-900">
          <button
            onClick={handleDownload}
            className="w-full py-4 text-[10px] font-bold uppercase tracking-widest bg-neutral-800 text-white rounded-full hover:bg-neutral-700 transition"
          >
            Download Design
          </button>

          <button
            onClick={handleSaveDesign}
            disabled={isSaving}
            className={`w-full py-4 text-[10px] font-bold uppercase tracking-widest rounded-full transition shadow-xl ${
              isSaving
                ? "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {isSaving ? "Saving to Cloud..." : "Save Custom Design"}
          </button>

          <button
            onClick={() =>
              setColors({
                body: "#FFFFFF",
                sole: "#E60012",
                laces: "#1A1A1A",
                logo: "#1A1A1A",
              })
            }
            className="w-full py-4 text-[10px] font-bold uppercase tracking-widest border-2 border-neutral-700 text-neutral-400 rounded-full hover:border-white hover:text-white transition"
          >
            Reset Design
          </button>
        </div>
      </section>
    </div>
  );
}
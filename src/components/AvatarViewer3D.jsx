import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { Bounds, OrbitControls, useAnimations, useProgress, useTexture } from '@react-three/drei'
import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { LoopOnce, LoopRepeat, SRGBColorSpace } from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import { CHARACTERS, actionAt } from '../lib/characters3d'
import './AvatarViewer3D.css'

const MODEL_DIFFUSE = '/models/modelo4/texture_diffuse.png'

function CharacterLayer({
  src,
  looping,
  active,
  playToken,
  durationMs,
  onFinished,
}) {
  const group = useRef(null)
  const fbx = useLoader(FBXLoader, src)
  const clone = useMemo(() => cloneSkinned(fbx), [fbx])
  const { actions, names } = useAnimations(fbx.animations, group)
  const onFinishedRef = useRef(onFinished)
  const diffuse = useTexture(MODEL_DIFFUSE)

  useLayoutEffect(() => {
    diffuse.colorSpace = SRGBColorSpace
    diffuse.flipY = true
    diffuse.needsUpdate = true
    clone.traverse((node) => {
      if (!node.isMesh) return
      node.castShadow = false
      node.receiveShadow = false
      node.frustumCulled = false
      const materials = Array.isArray(node.material) ? node.material : [node.material]
      for (const material of materials) {
        if (!material) continue
        material.map = diffuse
        material.color?.set('#ffffff')
        material.needsUpdate = true
      }
    })
  }, [clone, diffuse])

  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])

  useEffect(() => {
    const clips = names?.length ? names : Object.keys(actions)
    const action = clips.map((name) => actions[name]).find(Boolean)
    if (!action) return undefined

    if (!active) {
      action.stop()
      action.reset()
      return undefined
    }

    action.reset()
    action.setLoop(looping ? LoopRepeat : LoopOnce, looping ? Infinity : 1)
    action.clampWhenFinished = !looping
    action.enabled = true
    action.fadeIn(0.12).play()

    if (looping) {
      return () => {
        action.fadeOut(0.1)
        action.stop()
      }
    }

    let done = false
    const finish = () => {
      if (done) return
      done = true
      onFinishedRef.current?.()
    }

    const mixer = action.getMixer()
    mixer.addEventListener('finished', finish)
    const timeout = window.setTimeout(finish, Math.max(durationMs, 400) + 80)

    return () => {
      mixer.removeEventListener('finished', finish)
      window.clearTimeout(timeout)
      action.stop()
    }
  }, [actions, names, active, playToken, looping, durationMs])

  return (
    <group ref={group} visible={active}>
      <primitive object={clone} />
    </group>
  )
}

const HOME_CAM = { position: [0, 1.02, 3.7], target: [0, 0.95, 0], fov: 33 }

function HomeCamera() {
  const { camera } = useThree()
  useLayoutEffect(() => {
    camera.position.set(...HOME_CAM.position)
    camera.lookAt(...HOME_CAM.target)
    camera.fov = HOME_CAM.fov
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function CharacterStage({
  spec,
  mood,
  playToken,
  actionIndex,
  preloadAction,
  onActionFinished,
  bare,
}) {
  const action = actionAt(spec, actionIndex)
  const dancing = mood === 'dancing' && Boolean(action)
  const scale = spec.scale || 1
  const character = (
    <group scale={scale} position={[0, 0, 0]}>
      <CharacterLayer
        src={bare && spec.homeIdleUrl ? spec.homeIdleUrl : spec.idleUrl}
        looping
        active={!dancing}
        playToken={0}
        durationMs={action?.durationMs}
      />
      {preloadAction && action ? (
        <CharacterLayer
          src={action.url}
          looping={false}
          active={dancing}
          playToken={playToken}
          durationMs={action.durationMs}
          onFinished={onActionFinished}
        />
      ) : null}
    </group>
  )

  return (
    <>
      {bare ? (
        <>
          <HomeCamera />
          <ambientLight intensity={1.2} />
          <hemisphereLight args={['#fff6d8', '#c45a12', 0.8]} />
          <directionalLight position={[2.2, 5, 3.6]} intensity={1.85} />
          <directionalLight position={[-2.4, 1.4, -1.2]} intensity={0.5} />
          {character}
        </>
      ) : (
        <>
          <ambientLight intensity={0.9} />
          <hemisphereLight args={['#cfe8ff', '#1a1206', 0.55]} />
          <directionalLight position={[2.4, 4.2, 3.2]} intensity={1.35} />
          <directionalLight position={[-2.2, 1.6, -1.4]} intensity={0.35} />
          <Bounds fit observe margin={1.15}>
            {character}
          </Bounds>
        </>
      )}
    </>
  )
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="gs-av3d-error">Não foi possível carregar o personagem.</div>
      )
    }
    return this.props.children
  }
}

function LoadingBadge() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div className="gs-av3d-fallback">
      A carregar… {Math.round(progress)}%
    </div>
  )
}

export default function AvatarViewer3D({
  characterId = 'modelo4',
  mood = 'idle',
  playToken = 0,
  actionIndex = 0,
  size = 220,
  fill = false,
  framed = true,
  enableTouch = true,
  preloadAction = false,
  onActionFinished,
  className = '',
}) {
  const spec = CHARACTERS[characterId] || CHARACTERS.modelo4
  const style = fill
    ? { width: '100%', height: '100%' }
    : { width: size, height: Math.round(size * (820 / 512)) }

  useEffect(() => {
    useTexture.preload(MODEL_DIFFUSE)
    useLoader.preload(FBXLoader, spec.idleUrl)
    if (spec.homeIdleUrl) useLoader.preload(FBXLoader, spec.homeIdleUrl)
    if (!preloadAction) return
    for (const action of spec.actions || []) {
      useLoader.preload(FBXLoader, action.url)
    }
  }, [spec, preloadAction])

  return (
    <div
      className={`gs-av3d ${framed ? '' : 'gs-av3d--bare'} ${className}`.trim()}
      style={style}
    >
      <ModelErrorBoundary resetKey={spec.id}>
        <Canvas
          camera={{ position: HOME_CAM.position, fov: HOME_CAM.fov, near: 0.1, far: 40 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.75]}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
        >
          <Suspense fallback={null}>
            <CharacterStage
              spec={spec}
              mood={mood}
              playToken={playToken}
              actionIndex={actionIndex}
              preloadAction={preloadAction}
              onActionFinished={onActionFinished}
              bare={!framed}
            />
          </Suspense>
          {enableTouch ? (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate
              minDistance={1.6}
              maxDistance={6.5}
              target={[0, 0.9, 0]}
              minPolarAngle={Math.PI / 3.6}
              maxPolarAngle={Math.PI / 1.75}
            />
          ) : null}
        </Canvas>
      </ModelErrorBoundary>
      <LoadingBadge />
    </div>
  )
}

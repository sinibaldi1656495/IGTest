'use strict';

Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var scene, camera, renderer, light, ball, ballStatic, arrowHelper, dividerFrontLeft, dividerFrontRight;
var remover, removerRotating, removerCentral;
var ballTexture, laneTexture, backTexture, wallFrontTexture;
var wallTextureColor, wallTextureAo, wallTextureAlpha, wallTextureDisp, wallTextureNormal, wallTextureMetallic, wallTextureRoughness, wallTextureEmissive;
var wallTextureColorL, wallTextureAoL, wallTextureAlphaL, wallTextureDispL, wallTextureNormalL, wallTextureMetallicL, wallTextureRoughnessL, wallTextureEmissiveL;
var lavaTextureColor, lavaTextureAo, lavaTextureDisp, lavaTextureNormal, lavaTextureSpec;
var laneTextureColor, laneTextureAo, laneTextureDisp, laneTextureNormal, laneTextureMetallic, laneTextureRoughness;
var energyMaterial, ballMaterial;
var innerHTMLString = "";
var textureCounter = 0;
const N_TEXTURES = 27;

var scores, scoreTotal, scorePartial = 0, scoreRounds = [];
var controls;
var pins = [], pinsBs = [];
var directionAngle = 0;
var round, turn;
var isWaitingForInitGame = false;
var gameOver = false;
var cameraFollowsBall = false;
var removerIsMoving = false;
var removerHasFinishedRotating = false;

const GRAVITY = -100;

const RED = 0;
const BLUE = 1;
const GREEN = 2;

var ballColor = RED;
var musicEnabled = true;
var newGameCounter = 0;

const CENTRAL_PIN = 720;
const DIST_BETWEEN_PINS = 12;
const DIST_BETWEEN_ROWS = Math.sqrt(3) / 2 * DIST_BETWEEN_PINS;
const N_LANES = 5; // must be odd
const GUTTER_SIZE_X = 9.25;
const GUTTER_SIZE_Y = 1;
const LANE_SIZE_X = 41.5;
const LANE_SIZE_Y = GUTTER_SIZE_X / 2;
const LANE_SIZE_Z = CENTRAL_PIN + DIST_BETWEEN_ROWS * 3 + 15;
const LAUNCH_AREA_SIZE_Z = 50;
const HIDDEN_AREA_SIZE_Z = 50;
const FRONT_WOOD_SIZE_Y = 50;
const FRONT_WOOD_SIZE_Z = 3;
const HOLE_SIZE_Y = 30;
const DIVIDER_SIZE_X = 5;
const DIVIDER_SIZE_Y = 7.5;
const DIST_BETWEEN_LANES = LANE_SIZE_X + 2 * GUTTER_SIZE_X + 2 * DIVIDER_SIZE_X;
const BACK_SIZE_Z = 100;
const BALL_RADIUS = 4.25;
const ROOM_SIZE_X = N_LANES * DIST_BETWEEN_LANES;
const ROOM_SIZE_Y = 150;
const ROOM_SIZE_Z = LANE_SIZE_Z + LAUNCH_AREA_SIZE_Z + BACK_SIZE_Z + HIDDEN_AREA_SIZE_Z;
const DIVIDER_FRONT_INIT_Z = CENTRAL_PIN - 15;
const DIVIDER_FRONT_SIZE_Z = ROOM_SIZE_Z - BACK_SIZE_Z - LAUNCH_AREA_SIZE_Z - DIVIDER_FRONT_INIT_Z;
const UNDERFLOOR_SIZE_Y = 30;
const BALL_START_Y = 20;
const BALL_MIN_Y = LANE_SIZE_Y + BALL_RADIUS;
const BALL_MAX_Y = 25;
const CANNON_X_STEP = 0.5;
const BALL_Y_STEP = 1;
const MAX_X_ANGLE_CANNON = Math.PI/12;
const MIN_X_ANGLE_CANNON = -Math.PI/12;
const MAX_Y_ANGLE_CANNON = Math.PI/12;
const MIN_Y_ANGLE_CANNON = -Math.PI/12;
const ANGLE_STEP = 0.005;
const PIN_WEIGHT = 1.5;
const BALL_WEIGHT = 7;
const BALL_IMPULSE_Z = 2000;

const REMOVER_SMALL_SIZE_X = GUTTER_SIZE_X / 2;
const REMOVER_SMALL_WIDTH = 1;
const REMOVER_RADIUS = 2.5;
const REMOVER_BIG_LENGTH = 48;
const REMOVER_POS_Y = 8;
const REMOVER_POS_Z = CENTRAL_PIN + 40;
const TRANSLATION_SIZE = 50;
const REMOVER_WEIGHT = 9999999; // simula una massa infinita

const C0_HEIGHT = 4;
const C0_RADIUS_UP = 8;
const C0_RADIUS_DOWN = 11;
const C1_HEIGHT = 8;
const C1_RADIUS_UP = 4;
const C1_RADIUS_DOWN = 6;
const C2_HEIGHT = 6;
const C2_RADIUS = 2;
const C3_LENGTH = 25;
const C3_RADIUS = 1;
const C4_HEIGHT = 10;
const C7_LENGTH = 30;
const C7_RADIUS_UP = 5;
const C7_RADIUS_DOWN = 6;
const C8_RADIUS = 6.75;
const C8_TUBE = 2.25;
const C9_RADIUS = 8;
const C9_TUBE = 0.6;
const C11_RADIUS = 0.15;
const C13_RADIUS = 1.5;
const C11_HEIGHT = C9_RADIUS + 4 + C13_RADIUS * 2;
const C12_LENGTH = C13_RADIUS * 2;
const C14_RADIUS = 1.5;

const CAMERA_START_X = 0;
const CAMERA_START_Y = 49.125; //LANE_SIZE_Y + C0_HEIGHT + C1_HEIGHT + C2_HEIGHT + C4_HEIGHT + C7_RADIUS_DOWN + C11_HEIGHT;
const CAMERA_START_Z = -137.25; //-C7_LENGTH / 2 - C7_RADIUS_DOWN - LANE_SIZE_X / 2 - 100;
const CAMERA_RADIUS = 111; //-CAMERA_START_Z - LANE_SIZE_X/2;

const CROOT1_LENGTH = LANE_SIZE_X+C0_RADIUS_DOWN*2;

var ccam, croot1, croot2, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, cball;
var angleXcannon = 0, angleYcannon = 0;
var ballPosX;

function initScene() {
	window.addEventListener( 'resize', onWindowResize, false );

	// SCENE
	scene = new Physijs.Scene();
	scene.setGravity(new THREE.Vector3(0, GRAVITY, 0));

	// RENDERER
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	// Enable shadows on renderer
	renderer.shadowMap.enabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	document.getElementById("canvas").innerHTML = "";
	document.getElementById("canvas").appendChild(renderer.domElement);

	// LIGHTS
	var ambLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambLight);

	var light1 = new THREE.PointLight(0xff8080, 0.5);
	light1.position.set(0, ROOM_SIZE_Y - 50, ROOM_SIZE_Z - BACK_SIZE_Z - 250);
	var light2 = new THREE.PointLight(0x80ff80, 0.3);
	light2.position.set(ROOM_SIZE_X/2 - 50, ROOM_SIZE_Y - 50, (ROOM_SIZE_Z - BACK_SIZE_Z)/2);
	var light3 = new THREE.PointLight(0x8080ff, 0.3);
	light3.position.set(-ROOM_SIZE_X/2 + 50, ROOM_SIZE_Y - 50, (ROOM_SIZE_Z - BACK_SIZE_Z)/2);
	var light4 = new THREE.PointLight(0xffffff, 0.5);
	light4.position.set(0, ROOM_SIZE_Y - 50, -BACK_SIZE_Z);

	//light1.castShadow = true;
	//light2.castShadow = true;
	//light3.castShadow = true;
	//light4.castShadow = true;

	scene.add(light1);
	scene.add(light2);
	scene.add(light3);
	scene.add(light4);

	/*var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
	dirLight.position.set(500,100,-500);
	scene.add(dirLight);*/

	// WALLS
	var floor = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, 0, ROOM_SIZE_Z - DIVIDER_FRONT_SIZE_Z),
		new THREE.MeshStandardMaterial({side: THREE.BackSide}),
		0
	);
	floor.position.set(0, 0, DIVIDER_FRONT_INIT_Z / 2 - (BACK_SIZE_Z + LAUNCH_AREA_SIZE_Z) / 2);
	floor.receiveShadow = true;
	scene.add(floor);

	var ceiling = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, 0, ROOM_SIZE_Z),
		new THREE.MeshStandardMaterial({
			color: 0xffffff,
			map: wallTextureColor,
			aoMap: wallTextureAo,
			alphaMap: wallTextureAlpha,
			normalMap: wallTextureNormal,
			displacementMap : wallTextureDisp,
			metalnessMap: wallTextureMetallic,
			roughnessMap: wallTextureRoughness,
			emissiveMap: wallTextureEmissive
		}),
		0
	);
	ceiling.position.set(0, ROOM_SIZE_Y, LANE_SIZE_Z + HIDDEN_AREA_SIZE_Z - ROOM_SIZE_Z / 2);
	ceiling.receiveShadow = true;
	scene.add(ceiling);

	var wallFront = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, ROOM_SIZE_Y - HOLE_SIZE_Y, 0),
		new THREE.MeshStandardMaterial({
			color: 0xffffff,
			map: wallTextureColor,
			aoMap: wallTextureAo,
			alphaMap: wallTextureAlpha,
			normalMap: wallTextureNormal,
			displacementMap : wallTextureDisp,
			metalnessMap: wallTextureMetallic,
			roughnessMap: wallTextureRoughness,
			emissiveMap: wallTextureEmissive
		}),
	);
	wallFront.position.set(0, (ROOM_SIZE_Y + HOLE_SIZE_Y) / 2, DIVIDER_FRONT_INIT_Z);
	wallFront.castShadow = true;
	wallFront.receiveShadow = false;
	scene.add(wallFront);

	var wallBack = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, ROOM_SIZE_Y, 0),
		new THREE.MeshStandardMaterial({
			color: 0xffffff,
			map: wallTextureColor,
			aoMap: wallTextureAo,
			alphaMap: wallTextureAlpha,
			normalMap: wallTextureNormal,
			displacementMap : wallTextureDisp,
			metalnessMap: wallTextureMetallic,
			roughnessMap: wallTextureRoughness,
			emissiveMap: wallTextureEmissive
		}),
	);
	wallBack.position.set(0, ROOM_SIZE_Y / 2, LANE_SIZE_Z + HIDDEN_AREA_SIZE_Z - ROOM_SIZE_Z);
	wallBack.scale.x = -1;
	wallBack.scale.z = -1;
	wallBack.receiveShadow = true;
	scene.add(wallBack);

	var wallLeft = new Physijs.BoxMesh(
		new THREE.CubeGeometry(0, ROOM_SIZE_Y, ROOM_SIZE_Z),
		new THREE.MeshStandardMaterial({
			color: 0xffffff,
			map: wallTextureColorL,
			aoMap: wallTextureAoL,
			alphaMap: wallTextureAlphaL,
			normalMap: wallTextureNormalL,
			displacementMap : wallTextureDispL,
			metalnessMap: wallTextureMetallicL,
			roughnessMap: wallTextureRoughnessL,
			emissiveMap: wallTextureEmissiveL
		}),
		0
	);
	wallLeft.position.set(ROOM_SIZE_X / 2, ROOM_SIZE_Y / 2, LANE_SIZE_Z + HIDDEN_AREA_SIZE_Z - ROOM_SIZE_Z / 2);
	wallLeft.receiveShadow = true;
	scene.add(wallLeft);

	var wallRight = new Physijs.BoxMesh(
		new THREE.CubeGeometry(0, ROOM_SIZE_Y, ROOM_SIZE_Z),
		new THREE.MeshStandardMaterial({
			color: 0xffffff,
			map: wallTextureColorL,
			aoMap: wallTextureAoL,
			alphaMap: wallTextureAlphaL,
			normalMap: wallTextureNormalL,
			displacementMap : wallTextureDispL,
			metalnessMap: wallTextureMetallicL,
			roughnessMap: wallTextureRoughnessL,
			emissiveMap: wallTextureEmissiveL
		}),
	);
	wallRight.position.set(-ROOM_SIZE_X / 2, ROOM_SIZE_Y / 2, LANE_SIZE_Z + HIDDEN_AREA_SIZE_Z - ROOM_SIZE_Z / 2);
	wallRight.scale.x = -1;
	wallRight.receiveShadow = true;
	scene.add(wallRight);

	var wallFrontHidden = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, ROOM_SIZE_Y, 0),
		new THREE.MeshStandardMaterial({color: 0x222222}),
		0
	);
	wallFrontHidden.position.set(0, ROOM_SIZE_Y / 2, LANE_SIZE_Z + HIDDEN_AREA_SIZE_Z);
	wallFrontHidden.castShadow = true;
	wallFrontHidden.receiveShadow = true;
	scene.add(wallFrontHidden);

	var wallUnderFloor = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, 0, DIVIDER_FRONT_SIZE_Z),
		new THREE.MeshStandardMaterial({color: 0x222222}),
		0
	);
	wallUnderFloor.position.set(0, -UNDERFLOOR_SIZE_Y, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
	wallUnderFloor.castShadow = true;
	wallUnderFloor.receiveShadow = true;
	scene.add(wallUnderFloor);

	var wallUnderBack = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, UNDERFLOOR_SIZE_Y, 0),
		new THREE.MeshStandardMaterial({color: 0xffffff}),
		0
	);
	wallUnderBack.position.set(0, -UNDERFLOOR_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z);
	wallUnderBack.castShadow = true;
	wallUnderBack.receiveShadow = true;
	scene.add(wallUnderBack);

	var wallUnderFront = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, UNDERFLOOR_SIZE_Y, 0),
		new THREE.MeshStandardMaterial({color: 0x222222}),
		0
	);
	wallUnderFront.position.set(0, -UNDERFLOOR_SIZE_Y / 2, LANE_SIZE_Z + HIDDEN_AREA_SIZE_Z);
	wallUnderFront.castShadow = true;
	wallUnderFront.receiveShadow = true;
	scene.add(wallUnderFront);

	// LANE
	var lane = new Physijs.ConvexMesh(
		new THREE.CubeGeometry(LANE_SIZE_X, LANE_SIZE_Y, LANE_SIZE_Z),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({
				side: THREE.DoubleSide,
				map: laneTextureColor,
				aoMap: laneTextureAo,
				displacementMap: laneTextureDisp,
				metalnessMap: laneTextureMetallic,
				normalMap: laneTextureNormal,
				roughnessMap: laneTextureRoughness
			}),
			0.5, // friction
			0.8
		),
		0
	);
	lane.position.set(0, LANE_SIZE_Y / 2, LANE_SIZE_Z / 2);
	lane.scale.x = -1;
	lane.scale.z = -1;
	lane.castShadow = true;
	lane.receiveShadow = true;
	scene.add(lane);

	// GUTTER
	var gutterLeft = new Physijs.BoxMesh(
		new THREE.CubeGeometry(GUTTER_SIZE_X, GUTTER_SIZE_Y, DIVIDER_FRONT_INIT_Z),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({color: 0x6d7272}),
			0.5, // friction
			0.8
		),
		0
	);
	gutterLeft.position.set(LANE_SIZE_X / 2 + GUTTER_SIZE_X / 2, GUTTER_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z / 2);
	gutterLeft.castShadow = true;
	gutterLeft.receiveShadow = true;
	scene.add(gutterLeft);

	var gutterRight = new Physijs.BoxMesh(
		new THREE.CubeGeometry(GUTTER_SIZE_X, GUTTER_SIZE_Y, DIVIDER_FRONT_INIT_Z),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({color: 0x6d7272}),
			0.5, // friction
			0.8
		),
		0
	);
	gutterRight.position.set(-LANE_SIZE_X / 2 - GUTTER_SIZE_X / 2, GUTTER_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z / 2);
	gutterRight.castShadow = true;
	gutterRight.receiveShadow = true;
	scene.add(gutterRight);

	// DIVIDERS
	var dividerLeft = new Physijs.BoxMesh(
		new THREE.CubeGeometry(DIVIDER_SIZE_X, DIVIDER_SIZE_Y, LANE_SIZE_Z),
		Physijs.createMaterial(
			energyMaterial,
			0.5, // friction
			0.8
		),
		0
	);
	dividerLeft.position.set(LANE_SIZE_X / 2 + GUTTER_SIZE_X + DIVIDER_SIZE_X / 2, DIVIDER_SIZE_Y / 2, LANE_SIZE_Z / 2);
	dividerLeft.castShadow = true;
	dividerLeft.receiveShadow = true;
	scene.add(dividerLeft);

	var dividerRight = new Physijs.BoxMesh(
		new THREE.CubeGeometry(DIVIDER_SIZE_X, DIVIDER_SIZE_Y, LANE_SIZE_Z ),
		Physijs.createMaterial(
			energyMaterial,
			0.5, // friction
			0.8
		),
		0
	);
	dividerRight.position.set(-LANE_SIZE_X / 2 - GUTTER_SIZE_X - DIVIDER_SIZE_X / 2, DIVIDER_SIZE_Y / 2, LANE_SIZE_Z / 2);
	dividerRight.castShadow = true;
	dividerRight.receiveShadow = true;
	scene.add(dividerRight);

	dividerFrontLeft = new Physijs.BoxMesh(
		new THREE.CubeGeometry(DIVIDER_SIZE_X, HOLE_SIZE_Y, DIVIDER_FRONT_SIZE_Z),
		Physijs.createMaterial(
			//energyMaterial,
			new THREE.MeshStandardMaterial({color: 0x808080, metalness: 1}),
			0.5, // friction
			0.8
		),
		0
	);
	dividerFrontLeft.position.set(LANE_SIZE_X / 2 + GUTTER_SIZE_X + DIVIDER_SIZE_X / 2, HOLE_SIZE_Y / 2, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
	dividerFrontLeft.castShadow = true;
	dividerFrontLeft.receiveShadow = true;
	scene.add(dividerFrontLeft);

	dividerFrontRight = new Physijs.BoxMesh(
		new THREE.CubeGeometry(DIVIDER_SIZE_X, HOLE_SIZE_Y, DIVIDER_FRONT_SIZE_Z),
		Physijs.createMaterial(
			//energyMaterial,
			new THREE.MeshStandardMaterial({color: 0x808080, metalness: 1}),
			0.5, // friction
			0.8
		),
		0
	);
	dividerFrontRight.position.set(-LANE_SIZE_X / 2 - GUTTER_SIZE_X - DIVIDER_SIZE_X / 2, HOLE_SIZE_Y / 2, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
	dividerFrontRight.castShadow = true;
	dividerFrontRight.receiveShadow = true;
	scene.add(dividerFrontRight);

	// BALL
	ball = new Physijs.SphereMesh(
		new THREE.SphereGeometry(BALL_RADIUS, 64, 64),
		Physijs.createMaterial(
			ballMaterial,
			0.32,
			0.8
		),
		BALL_WEIGHT
	);
	ball.castShadow = true;
	ball.receiveShadow = true;

	var back = new Physijs.BoxMesh(
		new THREE.CubeGeometry(ROOM_SIZE_X, LANE_SIZE_Y, BACK_SIZE_Z),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({color: 0x0, metalness: 1}),
			0.5,
			0.8
		),
		0
	);
	back.castShadow = true;
	back.receiveShadow = true;
	back.position.set(0, LANE_SIZE_Y / 2, -BACK_SIZE_Z / 2);
	scene.add(back);

	for (var i = 1; i < N_LANES / 2; i++) {
		// left
		var _lane = lane.clone();
		_lane.position.set(i * DIST_BETWEEN_LANES, LANE_SIZE_Y / 2, LANE_SIZE_Z / 2);
		_lane._physijs.mass = 0;
		scene.add(_lane);

		var _gutterLeft = gutterLeft.clone();
		_gutterLeft.position.set(i * DIST_BETWEEN_LANES + LANE_SIZE_X / 2 + GUTTER_SIZE_X / 2, GUTTER_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z / 2);
		_gutterLeft._physijs.mass = 0;
		scene.add(_gutterLeft);

		var _gutterRight = gutterRight.clone();
		_gutterRight.position.set(i * DIST_BETWEEN_LANES - LANE_SIZE_X / 2 - GUTTER_SIZE_X / 2, GUTTER_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z / 2);
		_gutterRight._physijs.mass = 0;
		scene.add(_gutterRight);

		var _dividerLeft = dividerLeft.clone();
		_dividerLeft.position.set(i * DIST_BETWEEN_LANES + LANE_SIZE_X / 2 + GUTTER_SIZE_X + DIVIDER_SIZE_X / 2, DIVIDER_SIZE_Y / 2, LANE_SIZE_Z / 2);
		_dividerLeft._physijs.mass = 0;
		scene.add(_dividerLeft);

		var _dividerRight = dividerRight.clone();
		_dividerRight.position.set(i * DIST_BETWEEN_LANES - LANE_SIZE_X / 2 - GUTTER_SIZE_X - DIVIDER_SIZE_X / 2, DIVIDER_SIZE_Y / 2, LANE_SIZE_Z / 2);
		_dividerRight._physijs.mass = 0;
		scene.add(_dividerRight);

		var _dividerFrontLeft = dividerFrontLeft.clone();
		_dividerFrontLeft.position.set(i * DIST_BETWEEN_LANES + LANE_SIZE_X / 2 + GUTTER_SIZE_X + DIVIDER_SIZE_X / 2, HOLE_SIZE_Y / 2, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
		_dividerFrontLeft._physijs.mass = 0;
		scene.add(_dividerFrontLeft);

		var _dividerFrontRight = dividerFrontRight.clone();
		_dividerFrontRight.position.set(i * DIST_BETWEEN_LANES - LANE_SIZE_X / 2 - GUTTER_SIZE_X - DIVIDER_SIZE_X / 2, HOLE_SIZE_Y / 2, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
		_dividerFrontRight._physijs.mass = 0;
		scene.add(_dividerFrontRight);

		// right
		_lane = lane.clone();
		_lane._physijs.mass = 0;
		_lane.position.set(-i * DIST_BETWEEN_LANES, LANE_SIZE_Y / 2, LANE_SIZE_Z / 2);
		scene.add(_lane);

		_gutterLeft = gutterLeft.clone();
		_gutterLeft._physijs.mass = 0;
		_gutterLeft.position.set(-i * DIST_BETWEEN_LANES + LANE_SIZE_X / 2 + GUTTER_SIZE_X / 2, GUTTER_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z / 2);
		scene.add(_gutterLeft);

		_gutterRight = gutterRight.clone();
		_gutterRight._physijs.mass = 0;
		_gutterRight.position.set(-i * DIST_BETWEEN_LANES - LANE_SIZE_X / 2 - GUTTER_SIZE_X / 2, GUTTER_SIZE_Y / 2, DIVIDER_FRONT_INIT_Z / 2);
		scene.add(_gutterRight);

		_dividerLeft = dividerLeft.clone();
		_dividerLeft.position.set(-i * DIST_BETWEEN_LANES + LANE_SIZE_X / 2 + GUTTER_SIZE_X + DIVIDER_SIZE_X / 2, DIVIDER_SIZE_Y / 2, LANE_SIZE_Z / 2);
		_dividerLeft._physijs.mass = 0;
		scene.add(_dividerLeft);

		_dividerRight = dividerRight.clone();
		_dividerRight.position.set(-i * DIST_BETWEEN_LANES - LANE_SIZE_X / 2 - GUTTER_SIZE_X - DIVIDER_SIZE_X / 2, DIVIDER_SIZE_Y / 2, LANE_SIZE_Z / 2);
		_dividerRight._physijs.mass = 0;
		scene.add(_dividerRight);

		_dividerFrontLeft = dividerFrontLeft.clone();
		_dividerFrontLeft.position.set(-i * DIST_BETWEEN_LANES + LANE_SIZE_X / 2 + GUTTER_SIZE_X + DIVIDER_SIZE_X / 2, HOLE_SIZE_Y / 2, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
		_dividerFrontLeft._physijs.mass = 0;
		scene.add(_dividerFrontLeft);

		_dividerFrontRight = dividerFrontRight.clone();
		_dividerFrontRight.position.set(-i * DIST_BETWEEN_LANES - LANE_SIZE_X / 2 - GUTTER_SIZE_X - DIVIDER_SIZE_X / 2, HOLE_SIZE_Y / 2, DIVIDER_FRONT_SIZE_Z / 2 + DIVIDER_FRONT_INIT_Z);
		_dividerFrontRight._physijs.mass = 0;
		scene.add(_dividerFrontRight);
	}

	spawnRemover();

	spawnCannon();

	ballPosX = ball.position.x;


	// CAMERA
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
	// Camera position
	camera.position.set(0, 49.125, -137.25);
	// Camera look
	//camera.lookAt(new THREE.Vector3(0, 47.625, -30));
	croot1.updateMatrixWorld();
	camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
	scene.add(camera);

	// CONTROLS (enable camera control with mouse)
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enabled = false;


	requestAnimationFrame(render);
}

function spawnRemover() {

	remover = createVoidObject(REMOVER_WEIGHT);
	remover.position.set(0, REMOVER_POS_Y, REMOVER_POS_Z);

	removerRotating = createVoidObject(REMOVER_WEIGHT);

	removerCentral = new Physijs.ConvexMesh(
		new THREE.CylinderGeometry(REMOVER_RADIUS, REMOVER_RADIUS, LANE_SIZE_X + GUTTER_SIZE_X, 64),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 1.0}),
			0.4,
			0.8
		),
		REMOVER_WEIGHT
	);
	removerCentral.castShadow = true;
	removerCentral.receiveShadow = true;
	removerCentral.position.set(0, REMOVER_BIG_LENGTH, 0);
	removerCentral.rotation.z = Math.PI / 2;
	removerRotating.add(removerCentral);

	var removerBigLeft = new Physijs.BoxMesh(
		new THREE.CubeGeometry(REMOVER_SMALL_WIDTH, REMOVER_BIG_LENGTH, REMOVER_SMALL_WIDTH),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 1.0}),
			0.4,
			0.8
		),
		REMOVER_WEIGHT
	);
	removerBigLeft.castShadow = true;
	removerBigLeft.receiveShadow = true;
	removerBigLeft.position.set(LANE_SIZE_X / 2 + GUTTER_SIZE_X / 2, REMOVER_BIG_LENGTH / 2, 0);
	removerRotating.add(removerBigLeft);

	var removerBigRight = removerBigLeft.clone();
	removerBigRight.position.set(-LANE_SIZE_X / 2 - GUTTER_SIZE_X / 2, REMOVER_BIG_LENGTH / 2, 0);
	removerRotating.add(removerBigRight);

	var removerSmallLeft = new Physijs.BoxMesh(
		new THREE.CubeGeometry(REMOVER_SMALL_SIZE_X, REMOVER_SMALL_WIDTH, REMOVER_SMALL_WIDTH),
		Physijs.createMaterial(
			new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 1.0}),
			0.4,
			0.8
		),
		REMOVER_WEIGHT
	);
	removerSmallLeft.castShadow = true;
	removerSmallLeft.receiveShadow = true;
	removerSmallLeft.position.set(LANE_SIZE_X / 2 + GUTTER_SIZE_X / 2 + REMOVER_SMALL_SIZE_X / 2, 0, 0);
	remover.add(removerSmallLeft);

	var removerSmallRight = removerSmallLeft.clone();
	removerSmallRight.position.set(-LANE_SIZE_X / 2 - GUTTER_SIZE_X / 2 - REMOVER_SMALL_SIZE_X / 2, 0, 0);
	remover.add(removerSmallRight);

	remover.add(removerRotating);
	scene.add(remover);
}

function createVoidObject(weight) {
	var obj = new Physijs.BoxMesh(
		new THREE.CubeGeometry(0, 0, 0),
		Physijs.createMaterial(
			new THREE.MeshBasicMaterial,
			0.4,
			0.8
		),
		weight
	);
	return obj;
}

function preload() {
	// Funzione per caricare anticipatamente le textures
	var loader = new THREE.TextureLoader();

	wallTextureAo = loader.load("textures/walls/ao.jpg", onLoad);
	wallTextureColor = loader.load("textures/walls/color.jpg", onLoad);
	wallTextureDisp = loader.load("textures/walls/displacement.png", onLoad);
	wallTextureNormal = loader.load("textures/walls/normal.jpg", onLoad);
	wallTextureAlpha = loader.load("textures/walls/alpha.jpg", onLoad);
	wallTextureMetallic = loader.load("textures/walls/metallic.jpg", onLoad);
	wallTextureRoughness = loader.load("textures/walls/roughness.jpg", onLoad);
	wallTextureEmissive = loader.load("textures/walls/emissive.jpg", onLoad);
	wallTextureAo.wrapS = THREE.RepeatWrapping;
	wallTextureAo.wrapT = THREE.RepeatWrapping;
	wallTextureColor.wrapS = THREE.RepeatWrapping;
	wallTextureColor.wrapT = THREE.RepeatWrapping;
	wallTextureDisp.wrapS = THREE.RepeatWrapping;
	wallTextureDisp.wrapT = THREE.RepeatWrapping;
	wallTextureNormal.wrapS = THREE.RepeatWrapping;
	wallTextureNormal.wrapT = THREE.RepeatWrapping;
	wallTextureAlpha.wrapS = THREE.RepeatWrapping;
	wallTextureAlpha.wrapT = THREE.RepeatWrapping;
	wallTextureMetallic.wrapS = THREE.RepeatWrapping;
	wallTextureMetallic.wrapT = THREE.RepeatWrapping;
	wallTextureRoughness.wrapS = THREE.RepeatWrapping;
	wallTextureRoughness.wrapT = THREE.RepeatWrapping;
	wallTextureEmissive.wrapS = THREE.RepeatWrapping;
	wallTextureEmissive.wrapT = THREE.RepeatWrapping;
	wallTextureAo.repeat.set(10, 3);
	wallTextureColor.repeat.set(10, 3);
	wallTextureDisp.repeat.set(10, 3);
	wallTextureNormal.repeat.set(10, 3);
	wallTextureAlpha.repeat.set(10, 3);
	wallTextureMetallic.repeat.set(10, 3);
	wallTextureRoughness.repeat.set(10, 3);
	wallTextureEmissive.repeat.set(10, 3);

	wallTextureAoL = loader.load("textures/walls/ao.jpg", onLoad);
	wallTextureColorL = loader.load("textures/walls/color.jpg", onLoad);
	wallTextureDispL = loader.load("textures/walls/displacement.png", onLoad);
	wallTextureNormalL = loader.load("textures/walls/normal.jpg", onLoad);
	wallTextureAlphaL = loader.load("textures/walls/alpha.jpg", onLoad);
	wallTextureMetallicL = loader.load("textures/walls/metallic.jpg", onLoad);
	wallTextureRoughnessL = loader.load("textures/walls/roughness.jpg", onLoad);
	wallTextureEmissiveL = loader.load("textures/walls/emissive.jpg", onLoad);
	wallTextureAoL.wrapS = THREE.RepeatWrapping;
	wallTextureAoL.wrapT = THREE.RepeatWrapping;
	wallTextureColorL.wrapS = THREE.RepeatWrapping;
	wallTextureColorL.wrapT = THREE.RepeatWrapping;
	wallTextureDispL.wrapS = THREE.RepeatWrapping;
	wallTextureDispL.wrapT = THREE.RepeatWrapping;
	wallTextureNormalL.wrapS = THREE.RepeatWrapping;
	wallTextureNormalL.wrapT = THREE.RepeatWrapping;
	wallTextureAlphaL.wrapS = THREE.RepeatWrapping;
	wallTextureAlphaL.wrapT = THREE.RepeatWrapping;
	wallTextureMetallicL.wrapS = THREE.RepeatWrapping;
	wallTextureMetallicL.wrapT = THREE.RepeatWrapping;
	wallTextureRoughnessL.wrapS = THREE.RepeatWrapping;
	wallTextureRoughnessL.wrapT = THREE.RepeatWrapping;
	wallTextureEmissiveL.wrapS = THREE.RepeatWrapping;
	wallTextureEmissiveL.wrapT = THREE.RepeatWrapping;
	wallTextureAoL.repeat.set(27, 3);
	wallTextureColorL.repeat.set(27, 3);
	wallTextureDispL.repeat.set(27, 3);
	wallTextureNormalL.repeat.set(27, 3);
	wallTextureAlphaL.repeat.set(27, 3);
	wallTextureMetallicL.repeat.set(27, 3);
	wallTextureRoughnessL.repeat.set(27, 3);
	wallTextureEmissiveL.repeat.set(27, 3);

	if (ballColor == RED) {
		lavaTextureAo = loader.load("textures/magma/ao.png", onLoad);
		lavaTextureColor = loader.load("textures/magma/color.png", onLoad);
		lavaTextureDisp = loader.load("textures/magma/displacement.png", onLoad);
		lavaTextureNormal = loader.load("textures/magma/normal.png", onLoad);
		lavaTextureSpec = loader.load("textures/magma/specular.png", onLoad);
	} else if (ballColor == GREEN) {
		lavaTextureAo = loader.load("textures/bacteria/ao.jpg", onLoad);
		lavaTextureColor = loader.load("textures/bacteria/color.jpg", onLoad);
		lavaTextureDisp = loader.load("textures/bacteria/displacement.png", onLoad);
		lavaTextureNormal = loader.load("textures/bacteria/normal.jpg", onLoad);
		lavaTextureSpec = loader.load("textures/bacteria/specular.jpg", onLoad);
	} else if (ballColor == BLUE) {
		lavaTextureAo = loader.load("textures/water/ao.jpg", onLoad);
		lavaTextureColor = loader.load("textures/water/color.jpg", onLoad);
		lavaTextureDisp = loader.load("textures/water/displacement.png", onLoad);
		lavaTextureNormal = loader.load("textures/water/normal.jpg", onLoad);
		lavaTextureSpec = loader.load("textures/water/roughness.jpg", onLoad);
	}

	laneTextureAo = loader.load("textures/lanes/ao.jpg", onLoad);
	laneTextureColor = loader.load("textures/lanes/color.jpg", onLoad);
	laneTextureDisp = loader.load("textures/lanes/displacement.png", onLoad);
	laneTextureNormal = loader.load("textures/lanes/normal.jpg", onLoad);
	laneTextureMetallic = loader.load("textures/lanes/metallic.jpg", onLoad);
	laneTextureRoughness = loader.load("textures/lanes/roughness.jpg", onLoad);
	laneTextureAo.wrapS = THREE.RepeatWrapping;
	laneTextureAo.wrapT = THREE.RepeatWrapping;
	laneTextureColor.wrapS = THREE.RepeatWrapping;
	laneTextureColor.wrapT = THREE.RepeatWrapping;
	laneTextureDisp.wrapS = THREE.RepeatWrapping;
	laneTextureDisp.wrapT = THREE.RepeatWrapping;
	laneTextureNormal.wrapS = THREE.RepeatWrapping;
	laneTextureNormal.wrapT = THREE.RepeatWrapping;
	laneTextureMetallic.wrapS = THREE.RepeatWrapping;
	laneTextureMetallic.wrapT = THREE.RepeatWrapping;
	laneTextureRoughness.wrapS = THREE.RepeatWrapping;
	laneTextureRoughness.wrapT = THREE.RepeatWrapping;
	laneTextureAo.repeat.set(1, 15);
	laneTextureColor.repeat.set(1, 15);
	laneTextureDisp.repeat.set(1, 15);
	laneTextureNormal.repeat.set(1, 15);
	laneTextureMetallic.repeat.set(1, 15);
	laneTextureRoughness.repeat.set(1, 15);

	energyMaterial = new THREE.MeshPhongMaterial({
		map: lavaTextureColor,
		aoMap: lavaTextureAo,
		displacementMap: lavaTextureDisp,
		normalMap: lavaTextureNormal,
		specularMap: lavaTextureSpec
	});

	ballMaterial = new THREE.MeshPhongMaterial({
		map: lavaTextureColor,
		aoMap: lavaTextureAo,
		normalMap: lavaTextureNormal,
		specularMap: lavaTextureSpec
	});
}

function createPin() {
	var pin0, pin1, pin2, pin3, pin4, pin5, pin6, pin7, pin8, pin9, pin10, pin11, pin12, pin13, pin14, pin15;

	var pinMaterial = new THREE.MeshStandardMaterial({color: 0xa3a6ab});
	var pinMaterialBlack = new THREE.MeshStandardMaterial({color: 0x000303});
	var invisibleMaterial = Physijs.createMaterial(new THREE.MeshStandardMaterial({visible: false}), 1, 0);

	var pinPhys = new Physijs.CylinderMesh(new THREE.CylinderGeometry(2.39, 2.39, 15, 64), invisibleMaterial, PIN_WEIGHT);

	pin0 = new THREE.Mesh(new THREE.CylinderGeometry(1.13, 1.13, 0, 64), pinMaterial);
	pin1 = new THREE.Mesh(new THREE.CylinderGeometry(1.41, 1.13, 0.75, 64), pinMaterial);
	pin2 = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.41, 1.5, 64), pinMaterial);
	pin3 = new THREE.Mesh(new THREE.CylinderGeometry(2.26, 1.95, 1.125, 64), pinMaterial);
	pin4 = new THREE.Mesh(new THREE.CylinderGeometry(2.39, 2.26, 1.125, 64), pinMaterial);
	pin5 = new THREE.Mesh(new THREE.CylinderGeometry(2.28, 2.39, 1.375, 64), pinMaterial);
	pin6 = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 2.28, 1.375, 64), pinMaterial);
	pin7 = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.85, 1.375, 64), pinMaterial);
	pin8 = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.24, 0.75, 64), pinMaterial);
	pin9 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.98, 0.625, 64), pinMaterialBlack);
	pin10 = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 0.9, 0.875, 64), pinMaterial);
	pin11 = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.94, 0.875, 64), pinMaterialBlack);
	pin12 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.05, 0.875, 64), pinMaterial);
	pin13 = new THREE.Mesh(new THREE.CylinderGeometry(1.27, 1.2, 0.875, 64), pinMaterial);
	pin14 = new THREE.Mesh(new THREE.CylinderGeometry(1.27, 1.27, 0.227, 64), pinMaterial);
	pin15 = new THREE.Mesh(new THREE.SphereGeometry(1.273, 64, 64), pinMaterial);

	pin0.add(pin1, pin2, pin3, pin4, pin5, pin6, pin7, pin8, pin9, pin10, pin11, pin12, pin13, pin14, pin15);
	pinPhys.add(pin0);

	pin0.position.set(0, -7.5, 0);
	pin1.position.set(0, 0.375, 0);
	pin2.position.set(0, 1.5, 0);
	pin3.position.set(0, 2.8125, 0);
	pin4.position.set(0, 3.9375, 0);
	pin5.position.set(0, 5.1875, 0);
	pin6.position.set(0, 6.5625, 0);
	pin7.position.set(0, 7.9375, 0);
	pin8.position.set(0, 9, 0);
	pin9.position.set(0, 9.6875, 0);
	pin10.position.set(0, 10.4375, 0);
	pin11.position.set(0, 11.3125, 0);
	pin12.position.set(0, 12.1875, 0);
	pin13.position.set(0, 13.0625, 0);
	pin14.position.set(0, 13.6135, 0);
	pin15.position.set(0, 13.6135, 0);

	pin0.castShadow = true;
	pinPhys.castShadow = true;

	return pinPhys;
}

function spawnPins(bs) {
	for (var i = 0; i < 10; i++) {
		if (bs[i]) pins[i] = createPin();
	}

	pins[0].position.set(0, 7.5 + LANE_SIZE_Y, CENTRAL_PIN);
	pins[1].position.set(-DIST_BETWEEN_PINS * 0.5, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS);
	pins[2].position.set(DIST_BETWEEN_PINS * 0.5, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS);
	pins[3].position.set(-DIST_BETWEEN_PINS, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 2);
	pins[4].position.set(0, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 2);
	pins[5].position.set(DIST_BETWEEN_PINS, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 2);
	pins[6].position.set(-DIST_BETWEEN_PINS * 1.5, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 3);
	pins[7].position.set(-DIST_BETWEEN_PINS * 0.5, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 3);
	pins[8].position.set(DIST_BETWEEN_PINS * 0.5, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 3);
	pins[9].position.set(DIST_BETWEEN_PINS * 1.5, 7.5 + LANE_SIZE_Y, CENTRAL_PIN + DIST_BETWEEN_ROWS * 3);

	for (var i = 0; i < 10; i++) {
		if (bs[i]) scene.add(pins[i]);
		pins[i].setAngularVelocity(new THREE.Vector3(0, 0, 0));
		pins[i].setLinearVelocity(new THREE.Vector3(0, 0, 0));
	}
}

function spawnCannon() {
	var cannonMaterial = new THREE.MeshStandardMaterial({color: 0x808080, side: THREE.DoubleSide});

	ccam = new THREE.Object3D();
	croot1 = new THREE.Mesh(new THREE.CylinderGeometry(C3_RADIUS, C3_RADIUS, CROOT1_LENGTH, 64), cannonMaterial);
	croot2 = new THREE.Mesh(new THREE.CylinderGeometry(C3_RADIUS, C3_RADIUS, CROOT1_LENGTH, 64), cannonMaterial);
	c0 = new THREE.Mesh(new THREE.CylinderGeometry(C0_RADIUS_UP, C0_RADIUS_DOWN, C0_HEIGHT, 64), cannonMaterial);
	c1 = new THREE.Mesh(new THREE.CylinderGeometry(C1_RADIUS_UP, C1_RADIUS_DOWN, C1_HEIGHT, 64), cannonMaterial);
	c2 = new THREE.Mesh(new THREE.CylinderGeometry(C2_RADIUS, C2_RADIUS, C2_HEIGHT, 64), cannonMaterial);
	c3 = new THREE.Mesh(new THREE.CylinderGeometry(C3_RADIUS, C3_RADIUS, C3_LENGTH, 64), cannonMaterial);
	c4 = new THREE.Mesh(new THREE.CylinderGeometry(C3_RADIUS, C3_RADIUS, C4_HEIGHT, 64), cannonMaterial);
	c5 = new THREE.Mesh(new THREE.CylinderGeometry(C3_RADIUS, C3_RADIUS, C4_HEIGHT, 64), cannonMaterial);
	c6 = new THREE.Mesh(new THREE.CylinderGeometry(C3_RADIUS, C3_RADIUS, C3_LENGTH, 64), cannonMaterial);
	c7 = new THREE.Mesh(new THREE.CylinderGeometry(C7_RADIUS_UP, C7_RADIUS_DOWN, C7_LENGTH, 64, 1, true), cannonMaterial);
	c8 = new THREE.Mesh(new THREE.TorusGeometry(C8_RADIUS, C8_TUBE, 6, 200), cannonMaterial);
	c9 = new THREE.Mesh(new THREE.TorusGeometry(C9_RADIUS, C9_TUBE, 30, 200), energyMaterial);
	c10 = new THREE.Mesh(new THREE.TorusGeometry(C9_RADIUS, C9_TUBE, 30, 200), energyMaterial);
	c11 = new THREE.Mesh(new THREE.CylinderGeometry(C11_RADIUS, C11_RADIUS, C11_HEIGHT, 64), cannonMaterial);
	c12 = new THREE.Mesh(new THREE.CylinderGeometry(C11_RADIUS, C11_RADIUS, C12_LENGTH, 64), cannonMaterial);
	c13 = new THREE.Mesh(new THREE.TorusGeometry(C13_RADIUS, C11_RADIUS, 30, 200), cannonMaterial);
	c14 = new THREE.Mesh(new THREE.SphereGeometry(C14_RADIUS, 64, 64), cannonMaterial);
	c15 = new THREE.Mesh(new THREE.SphereGeometry(C14_RADIUS, 64, 64), cannonMaterial);
	c16 = new THREE.Mesh(new THREE.SphereGeometry(C14_RADIUS, 64, 64), cannonMaterial);
	c17 = new THREE.Mesh(new THREE.SphereGeometry(C14_RADIUS, 64, 64), cannonMaterial);
	c18 = new THREE.Mesh(new THREE.SphereGeometry(C7_RADIUS_DOWN, 64, 64), cannonMaterial);
	c19 = new THREE.Mesh(new THREE.TorusGeometry(C9_RADIUS, C9_TUBE, 30, 200), energyMaterial);
	cball = new THREE.Mesh(
		new THREE.SphereGeometry(BALL_RADIUS, 64, 64),
		ballMaterial
	);

	croot1.add(croot2);
	croot1.add(c0);
	c0.add(c1);
	c1.add(c2);
	c2.add(c3);
	c2.add(c4);
	c2.add(c5);
	c3.add(c6);
	c3.add(c14);
	c3.add(c15);
	c4.add(c16);
	c5.add(c17);
	c6.add(c7);
	c7.add(c8);
	c7.add(c9);
	c7.add(c10);
	c7.add(c11);
	c7.add(cball);
	c7.add(ccam);
	c11.add(c12);
	c12.add(c13);
	c7.add(c18);
	c1.add(c19);

	croot1.position.set(0, LANE_SIZE_Y, -LANE_SIZE_X/2);
	croot1.rotateZ(Math.PI/2);
	croot1.translateZ(-C0_RADIUS_DOWN);
	croot2.translateZ(C0_RADIUS_DOWN);
	c0.rotateZ(-Math.PI/2);
	c0.translateY(C0_HEIGHT/2+1);
	c0.translateZ(C0_RADIUS_DOWN/2);
	c1.translateY((C0_HEIGHT+C1_HEIGHT)/2);
	c2.translateY((C1_HEIGHT+C2_HEIGHT)/2);
	c3.translateY((C2_HEIGHT+C3_RADIUS)/2);
	c3.rotateZ(Math.PI/2);
	c4.translateX(C3_LENGTH/2);
	c4.translateY((C2_HEIGHT+C4_HEIGHT)/2+C3_RADIUS);
	c5.translateX(-C3_LENGTH/2);
	c5.translateY((C2_HEIGHT+C4_HEIGHT)/2+C3_RADIUS);
	c6.translateX(C4_HEIGHT);
	c7.rotateX(Math.PI/2);
	ccam.translateY(-CAMERA_RADIUS);
	ccam.translateX(C11_HEIGHT);
	c8.translateY(C7_LENGTH/2);
	c8.rotateX(Math.PI/2);
	c9.translateY(C7_LENGTH/4);
	c9.rotateX(Math.PI/2);
	c10.translateY(-C7_LENGTH/4);
	c10.rotateX(Math.PI/2);
	c11.translateY(-C7_LENGTH/8);
	c11.translateX(C11_HEIGHT/2);
	c11.rotateZ(Math.PI/2);
	c12.translateY(-C11_HEIGHT/2+C13_RADIUS);
	c12.rotateX(Math.PI/2);
	c13.rotateY(Math.PI/2)
	c14.translateY(C3_LENGTH/2);
	c15.translateY(-C3_LENGTH/2);
	c16.translateY(C4_HEIGHT/2-C14_RADIUS/2);
	c17.translateY(C4_HEIGHT/2-C14_RADIUS/2);
	c18.translateY(-C7_LENGTH/2);
	c18.rotateX(Math.PI/2);
	c19.rotateX(Math.PI/2);
	cball.translateY(C7_LENGTH/4);

	croot1.castShadow = true;

	scene.add(croot1);
}

function initGame() {
	initScene();
	isWaitingForInitGame = false;
	gameOver = false;
	scores = new Array(22+1).join(" ").split("");
	scoreRounds = new Array(10+1).join(" ").split("");
	scoreTotal = 0;
	round = 1;
	turn = 1;
	initGUI();

	//DEBUG
	/*
	round = 10;
	for (var i = 0; i<18; i++) {
		scores[i] = "-";
	}*/

	newGame([true, true, true, true, true, true,true, true, true, true]);
}

function newGame(bs) {
	initGUI();

	cameraFollowsBall = false;
	removerIsMoving = false;
	removerHasFinishedRotating = false;
	angleXcannon = 0;
	angleYcannon = 0;

	remover.rotation.set(0, 0, 0);
	remover.position.set(0, REMOVER_POS_Y, REMOVER_POS_Z);
	scene.remove(remover);
	spawnRemover();

	if (newGameCounter > 0) {
		scene.remove(croot1);
		spawnCannon();
		croot1.updateMatrixWorld();
		ball.position.set(cball.getWorldPosition().x, cball.getWorldPosition().y, cball.getWorldPosition().z);
		camera.position.set(CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z);
		camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
	} else {
		camera.position.set(CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z);
	}


	document.addEventListener("keydown", onDocumentKeyDown, false);
	document.getElementById("center").innerHTML = "";

	if (turn == 1 || (round == 11 && turn == 2 && scores[20] == 10)) {
		pinsBs = [true, true, true, true, true, true, true, true, true, true];
		bs = [true, true, true, true, true, true, true, true, true, true];
		scorePartial = 0;
	}

	for (var i = 0; i < 10; i++) {
		if (pins[i] != undefined) {
			scene.remove(pins[i]);
		}
	}
	scene.remove(ball);

	spawnPins(bs);

	ballStatic = new THREE.Mesh(
		new THREE.SphereGeometry(BALL_RADIUS, 64, 64),
		new THREE.MeshStandardMaterial({color: ballColor, roughness: 0.6, metalness: 0.8})
	);
	ballStatic.castShadow = true;
	ballStatic.receiveShadow = true;
	ballStatic.position.set(0, BALL_START_Y, 0);

	newGameCounter++;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        enableTouch();
    }
}

function endGame() {
	document.getElementById("center").innerHTML = "<button id='buttoncenter' onClick='isWaitingForInitGame = true; waitForInitGame();' class='button centeredbutton clickable'>GAME OVER!\nYour score is: " + scoreTotal + "<div class='smalltext centertext'>Click to continue</div></button>";
}

function waitForInitGame() {
	initGUI();
	document.getElementById("center").innerHTML = "";
	document.getElementById("topcenter").innerHTML = "<input onclick='initGame();' class='button bigbutton clickable' type='button' value='NEW GAME'>";
}

function initGUI() {
	document.getElementById("topleft").innerHTML = "<input id='buttontopleft' class='button clickable smalltext centertext' type='button' value='Enable/disable music' onclick='switchMusic()'></input>";
	document.getElementById("topright").innerHTML = "<button id='buttontopright' class='button clickable' onclick='addScore();'>Score: " + scoreTotal + "<div class='smalltext centertext'>Click for details</div></button>";
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        document.getElementById("bottomleft").innerHTML = "<input id='switchCamera' class='button clickable centertext' type='button' value='Fire test2' onclick='fireBall()'></input>";
    }
    else{
        document.getElementById("bottomleft").innerHTML = "<input id='switchCamera' class='button clickable smalltext centertext' type='button' value='Enable/disable free camera' onclick='switchCameraControl()'></input>";
    }
	document.getElementById("topcenter").innerHTML = "<input disabled class='button bigbutton' type='button' value='FRAME " + (round == 11 ? "EXTRA" : round) + " - ROLL " + turn + "'>";
	addCommands();
}

function removeGUI() {
	document.getElementById("topleft").innerHTML = "";
	document.getElementById("topright").innerHTML = "";
	document.getElementById("topcenter").innerHTML = "";
	document.getElementById("bottomleft").innerHTML = "";
	document.getElementById("bottomright").innerHTML = "";
}

function addCommands() {
	document.getElementById("bottomright").innerHTML = "<button disabled class='button'>CANNON CONTROLS" +
		"<div class='smalltext'>W - tilt up</div>" +
		"<div class='smalltext'>S - tilt down</div>" +
		"<div class='smalltext'>A - move left</div>" +
		"<div class='smalltext'>D - move right</div>" +
		"<div class='smalltext'>Q - tilt left</div>" +
		"<div class='smalltext'>E - tilt right</div>" +
		"<div class='smalltext'>SPACE - launch</div></button>";
}

/*function addOptions() {
	document.removeEventListener("keydown", onDocumentKeyDown);
	document.getElementById("topright").innerHTML = "";
	document.getElementById("topcenter").innerHTML = "";
	document.getElementById("bottomleft").innerHTML = "";
	document.getElementById("bottomright").innerHTML = "";
	document.getElementById("buttontopleft").disabled = true;
	document.getElementById("buttontopleft").setAttribute("class", document.getElementById("buttontopleft").getAttribute("class") + " clickactive");

	document.getElementById("center").innerHTML =
		"<div id='buttoncenter' class='button smalltext centertext'>" +
			"Change ball energy type" +
			"<div>" +
				"<input type='radio' name='ballcolor' id='blue' /><label class='clickablenb' for='blue'>Ice</label>" +
				"<input type='radio' name='ballcolor' id='red' /><label class='clickablenb' for='red'>Magma</label>" +
				"<input type='radio' name='ballcolor' id='green' /><label class='clickablenb' for='green'>Bacteria</label>" +
			"</div>" +
				"<input type='checkbox' id='enablemusic'/><label class='clickablenb' for='enablemusic'>Enable music</label>" +
		"</div>" +
		"<button class='button clickable' onClick='saveOptions(); removeOptions();'><div class='smalltext centertext'>Save options</div></button>";

	if (ballColor == BLUE) {
		document.getElementById("blue").checked = true;
	} else if (ballColor == RED) {
		document.getElementById("red").checked = true;
	} else if (ballColor == GREEN) {
		document.getElementById("green").checked = true;
	}
	document.getElementById("enablemusic").checked = musicEnabled;
}*/

function removeOptions() {
	initGUI();
	document.getElementById("center").innerHTML = "";
	document.addEventListener("keydown", onDocumentKeyDown, false);
}

/*function saveOptions() {
	if (document.getElementById("blue").checked) {
		ballColor = BLUE;
	} else if (document.getElementById("red").checked) {
		ballColor = RED;
	} else if (document.getElementById("green").checked) {
		ballColor = GREEN;
	}

	if (document.getElementById("enablemusic").checked) {
		musicEnabled = true;
		document.getElementById("audio").play();
	} else {
		musicEnabled = false;
		document.getElementById("audio").pause();
	}

	ball.material.color.setHex(ballColor);
	ballStatic.material.color.setHex(ballColor);
}*/

function switchMusic() {
	if (!musicEnabled) {
		musicEnabled = true;
		document.getElementById("audio").play();
	} else {
		musicEnabled = false;
		document.getElementById("audio").pause();
	}
}

function addScore() {
	document.removeEventListener("keydown", onDocumentKeyDown);
	document.getElementById("topleft").innerHTML = "";
	document.getElementById("topcenter").innerHTML = "";
	document.getElementById("bottomleft").innerHTML = "";
	document.getElementById("bottomright").innerHTML = "";
	document.getElementById("buttontopright").disabled = true;
	document.getElementById("buttontopright").setAttribute("class", document.getElementById("buttontopright").getAttribute("class") + " clickactive");

	document.getElementById("center").innerHTML =
		"<button id='buttoncenter' onclick='removeScore();' class='button centeredbutton clickable'>" +
			"<table style='width:100%'>" +
				"<tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>" +
				"<tr>" +
					"<td>" + scores[0] + "</td>" + "<td>" + scores[1] + "</td>" +
					"<td>" + scores[2] + "</td>" + "<td>" + scores[3] + "</td>" +
					"<td>" + scores[4] + "</td>" + "<td>" + scores[5] + "</td>" +
					"<td>" + scores[6] + "</td>" + "<td>" + scores[7] + "</td>" +
					"<td>" + scores[8] + "</td>" + "<td>" + scores[9] + "</td>" +
				"</tr>" +
				"<tr id='scoreRounds'>" +
					"<td>" + scoreRounds[0] + "</td>" +
					"<td>" + scoreRounds[1] + "</td>" +
					"<td>" + scoreRounds[2] + "</td>" +
					"<td>" + scoreRounds[3] + "</td>" +
					"<td>" + scoreRounds[4] + "</td>" +
				"</tr>" +
			"</table>" +
			"<table style='width:100%'>" +
				"<tr><th>6</th><th>7</th><th>8</th><th>9</th><th id='th10'>10</th></tr>" +
				"<tr>" +
					"<td>" + scores[10] + "</td>" + "<td>" + scores[11] + "</td>" +
					"<td>" + scores[12] + "</td>" + "<td>" + scores[13] + "</td>" +
					"<td>" + scores[14] + "</td>" + "<td>" + scores[15] + "</td>" +
					"<td>" + scores[16] + "</td>" + "<td>" + scores[17] + "</td>" +
					"<td>" + scores[18] + "</td>" + "<td>" + scores[19] + "</td>" +
					(round == 11 ? "<td id='specialTd'>" + scores[20] + "</td>" : "") +
					(round == 11 && turn == 2 ? "<td id='specialTd'>" + scores[21] + "</td>" : "") +
				"</tr>" +
				"<tr id='scoreRounds2'>" +
					"<td>" + scoreRounds[5] + "</td>" +
					"<td>" + scoreRounds[6] + "</td>" +
					"<td>" + scoreRounds[7] + "</td>" +
					"<td>" + scoreRounds[8] + "</td>" +
					"<td id='scoreRounds[9]'>" + scoreRounds[9] + "</td>" +
				"</tr>" +
			"</table>" +
			"<div class='smalltext centertext'>Click to continue</div>" +
		"</button>";

	var ths = document.getElementsByTagName("th");
	for (var i = 0; i < ths.length; i++) {
		ths[i].setAttribute("colspan", "2");
	}
	var sr = document.getElementById("scoreRounds").getElementsByTagName("td");
	for (var i = 0; i < sr.length; i++) {
		sr[i].setAttribute("colspan", "2");
	}
	var sr = document.getElementById("scoreRounds2").getElementsByTagName("td");
	for (var i = 0; i < sr.length; i++) {
		sr[i].setAttribute("colspan", "2");
	}
	var tds = document.getElementsByTagName("td");
	for (var i = 0; i < tds.length; i++) {
		if (tds[i].innerHTML == "X") {
			tds[i].setAttribute("colspan", "2");
			tds[i+1].remove();
		}
	}
	if (round == 11) {
		document.getElementById("th10").setAttribute("colspan", "3");
		document.getElementById("scoreRounds[9]").setAttribute("colspan", "3");
	}
}

function removeScore() {
	initGUI();
	if (isWaitingForInitGame) {
		document.getElementById("topcenter").innerHTML = "<input onclick='initGame();' class='button bigbutton clickable' type='button' value='NEW GAME'>";
	}
	document.getElementById("center").innerHTML = "";
	document.addEventListener("keydown", onDocumentKeyDown, false);
}

function scoreToInts(scores) {
	var ints = [];
	for (var i = 0; i < scores.length; i++) {
		if (scores[i] == "X") {
			ints[ints.length] = 10;
		} else if (scores[i] == "/") {
			ints[ints.length] = 10 - scores[i-1];
		} else if (scores[i] == "-") {
			ints[ints.length] = 0;
		} else if (scores[i] > 0 && scores[i] < 10) {
			ints[ints.length] = parseInt(scores[i]);
		}
	}
	return ints;
}

function switchCameraControl() {
	if (!controls.enabled) {
		controls.enabled = true;
		document.removeEventListener("keydown", onDocumentKeyDown);
		document.getElementById("topleft").innerHTML = "";
		document.getElementById("topright").innerHTML = "";
		document.getElementById("topcenter").innerHTML = "";
		document.getElementById("bottomright").innerHTML = "";
	} else {
		controls.enabled = false;
		camera.position.set(CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z);
		camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
		document.addEventListener("keydown", onDocumentKeyDown, false);
		initGUI();
	}
}


function onDocumentKeyDown(event) {
	var keyCode = event.which;
	switch (keyCode) {
		case 87: // W
			if (angleYcannon <= MAX_Y_ANGLE_CANNON) {
				c6.rotateY(ANGLE_STEP);
				angleYcannon += ANGLE_STEP;
				croot1.updateMatrixWorld();
				camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
				camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			}
			break;
		case 83: // S
			if (angleYcannon >= MIN_Y_ANGLE_CANNON) {
				c6.rotateY(-ANGLE_STEP);
				angleYcannon -= ANGLE_STEP;
				croot1.updateMatrixWorld();
				camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
				camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			}
			break;
		case 65: // A
			if (c0.position.y >= -CROOT1_LENGTH/2 + C0_RADIUS_DOWN) {
				c0.translateX(CANNON_X_STEP);
				croot1.updateMatrixWorld();
				camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
				camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			}

			break;
		case 68: // D
			if (c0.position.y <= CROOT1_LENGTH/2 - C0_RADIUS_DOWN) {
				c0.translateX(-CANNON_X_STEP);
				croot1.updateMatrixWorld();
				camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
				camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			}

			break;
		case 81: // Q
			if (angleXcannon <= MAX_X_ANGLE_CANNON) {
				c2.rotateY(ANGLE_STEP);
				angleXcannon += ANGLE_STEP;
				croot1.updateMatrixWorld();
				camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
				camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			}

			break;
		case 69: // E
			if (angleXcannon >= MIN_X_ANGLE_CANNON) {
				c2.rotateY(-ANGLE_STEP);
				angleXcannon -= ANGLE_STEP;
				croot1.updateMatrixWorld();
				camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
				camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			}
			break;
		case 32: // space
			croot1.updateMatrixWorld();
			camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
			camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
			document.removeEventListener("keydown", onDocumentKeyDown);
			scene.remove(ballStatic);
			document.getElementById("shoot").play();

			for (var i = 0; i < 10; i++) {
				pins[i].setAngularFactor(new THREE.Vector3(1, 1, 1));
				pins[i].setLinearFactor(new THREE.Vector3(1, 1, 1));
			}

			croot1.updateMatrixWorld();

			ball.position.set(cball.getWorldPosition().x, cball.getWorldPosition().y, cball.getWorldPosition().z);
			scene.add(ball);
			ball.applyCentralImpulse(new THREE.Vector3(0, 0, BALL_IMPULSE_Z).applyEuler(new THREE.Euler(-angleYcannon, angleXcannon, 0)));

			removeGUI();
			cameraFollowsBall = true;

			setTimeout(calcScore, 7500);

	}

}

function enableTouch(){
    var myElement = document.getElementById('canvas');

    // create a simple instance
    // by default, it only adds horizontal recognizers
    var mc = new Hammer(myElement);

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    // listen to events...
    mc.on("panleft panright panup pandown tap press", function(ev) {
        //myElement.textContent = ev.type +" gesture detected.";

            switch (""+ev.type) {
            case "panup": // W
                if (angleYcannon <= MAX_Y_ANGLE_CANNON) {
                    c6.rotateY(ANGLE_STEP);
                    angleYcannon += ANGLE_STEP;
                    croot1.updateMatrixWorld();
                    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                }
                break;
            case "pandown": // S
                if (angleYcannon >= MIN_Y_ANGLE_CANNON) {
                    c6.rotateY(-ANGLE_STEP);
                    angleYcannon -= ANGLE_STEP;
                    croot1.updateMatrixWorld();
                    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                }
                break;
            /*case 65: // A
                if (c0.position.y >= -CROOT1_LENGTH/2 + C0_RADIUS_DOWN) {
                    c0.translateX(CANNON_X_STEP);
                    croot1.updateMatrixWorld();
                    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                }

                break;
            case 68: // D
                if (c0.position.y <= CROOT1_LENGTH/2 - C0_RADIUS_DOWN) {
                    c0.translateX(-CANNON_X_STEP);
                    croot1.updateMatrixWorld();
                    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                }

                break;*/
            case "panleft": // Q
                if (angleXcannon <= MAX_X_ANGLE_CANNON) {
                    c2.rotateY(ANGLE_STEP);
                    angleXcannon += ANGLE_STEP;
                    croot1.updateMatrixWorld();
                    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                }

                break;
            case "panright": // E
                if (angleXcannon >= MIN_X_ANGLE_CANNON) {
                    c2.rotateY(-ANGLE_STEP);
                    angleXcannon -= ANGLE_STEP;
                    croot1.updateMatrixWorld();
                    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                }
                /*break;
            case 32: // space
                croot1.updateMatrixWorld();
                camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
                camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
                document.removeEventListener("keydown", onDocumentKeyDown);
                scene.remove(ballStatic);
                document.getElementById("shoot").play();

                for (var i = 0; i < 10; i++) {
                    pins[i].setAngularFactor(new THREE.Vector3(1, 1, 1));
                    pins[i].setLinearFactor(new THREE.Vector3(1, 1, 1));
                }

                croot1.updateMatrixWorld();

                ball.position.set(cball.getWorldPosition().x, cball.getWorldPosition().y, cball.getWorldPosition().z);
                scene.add(ball);
                ball.applyCentralImpulse(new THREE.Vector3(0, 0, BALL_IMPULSE_Z).applyEuler(new THREE.Euler(-angleYcannon, angleXcannon, 0)));

                removeGUI();
                cameraFollowsBall = true;

                setTimeout(calcScore, 7500);*/

        }
    });
}

function fireBall(){
    croot1.updateMatrixWorld();
    camera.position.set(ccam.getWorldPosition().x, ccam.getWorldPosition().y, ccam.getWorldPosition().z);
    camera.lookAt(new THREE.Vector3(c13.getWorldPosition().x, c13.getWorldPosition().y, c13.getWorldPosition().z));
    //document.removeEventListener("keydown", onDocumentKeyDown);
    scene.remove(ballStatic);
    document.getElementById("shoot").play();

    for (var i = 0; i < 10; i++) {
        pins[i].setAngularFactor(new THREE.Vector3(1, 1, 1));
        pins[i].setLinearFactor(new THREE.Vector3(1, 1, 1));
    }

    croot1.updateMatrixWorld();

    ball.position.set(cball.getWorldPosition().x, cball.getWorldPosition().y, cball.getWorldPosition().z);
    scene.add(ball);
    ball.applyCentralImpulse(new THREE.Vector3(0, 0, BALL_IMPULSE_Z).applyEuler(new THREE.Euler(-angleYcannon, angleXcannon, 0)));

    removeGUI();
    cameraFollowsBall = true;

    setTimeout(calcScore, 7500);
}

function calcScore() {
	var score = 0;
	for (var i = 0; i < 10; i++) {
		if (pins[i].position.y < 6 + LANE_SIZE_Y) {
			score++;
			pinsBs[i] = false;
		}
	}

	scorePartial += score;

	// ADDITIONAL TURN 1
	if (round == 11 && turn == 1) {
		scores[20] = score;
		if (scorePartial == 10) {
			//document.getElementById("center").innerHTML = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>STRIKE!<div class='smalltext centertext'>Click to continue </div></button>";
			innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>STRIKE!<div class='smalltext centertext'>Click to continue </div></button>";
		} else {
			//document.getElementById("center").innerHTML = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>" + score + " pin" + (score != 1 ? "s" : "") + " down!<div class='smalltext centertext'>Click to continue </div></button>";
			innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>" + score + " pin" + (score != 1 ? "s" : "") + " down!<div class='smalltext centertext'>Click to continue </div></button>";
		}
		if (scores[18] == "X") {
			turn = 2;
		} else {
			gameOver = true;
		}
	}
	// ADDITIONAL TURN 2
	else if (turn == 11 && round == 2) {
		scores[21] = score;
		if (scorePartial == 10) {
			innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>STRIKE!<div class='smalltext centertext'>Click to continue </div></button>";
		} else {
			innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>" + score + " pin" + (score != 1 ? "s" : "") + " down!<div class='smalltext centertext'>Click to continue </div></button>";
		}
		gameOver = true;
	}
	// STRIKE
	else if (scorePartial == 10 && turn == 1) {
		innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>STRIKE!<div class='smalltext centertext'>Click to continue </div></button>";
		scores[(round-1)*2] = "X";
		if (round <= 10) {
			turn = 1;
			round++;
		}
	}
	// SPARE
	else if (scorePartial == 10 && turn == 2) {
		innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>SPARE!<div class='smalltext centertext'>Click to continue </div></button>";
		scores[(round-1)*2+1] = "/";
		if (round <= 10) {
			turn = 1;
			round++;
		}
	}
	// NE' STRIKE NE' SPARE
	else if (scorePartial < 10) {
		innerHTMLString = "<button id='buttoncenter' onClick='newGame(pinsBs);' class='button centeredbutton clickable'>" + score + " pin" + (score != 1 ? "s" : "") + " down!<div class='smalltext centertext'>Click to continue </div></button>";
		if (score == 0) {
			scores[(round-1)*2+turn-1] = "-";
		} else {
			scores[(round-1)*2+turn-1] = score;
		}
		if (round < 10) {
			if (turn == 1) {
				turn = 2;
			} else if (turn == 2) {
				turn = 1;
				round++;
			}
		} else if (round == 10 && turn == 1) {
			turn = 2;
		} else if (round == 10 && turn == 2) {
			gameOver = true;
		}

	}
	else {
		window.alert("SOMETHING WENT WRONG!");
	}


	// DETERMINO PUNTEGGI PARZIALI

	var ints = scoreToInts(scores);
	var c = 0;

	for (var i = 0; i < scoreRounds.length; i++) {
		if (scores[i*2] == "X") {
			if (ints[c+1] != undefined && ints[c+2] != undefined) {
				scoreRounds[i] = 10 + ints[c+1] + ints[c+2];
			} else {
				scoreRounds[i] = " ";
			}
			c++;
		} else if (scores[i*2+1] == "/") {
			if (ints[c+2] != undefined) {
				scoreRounds[i] = 10 + ints[c+2];
			} else {
				scoreRounds[i] = " ";
			}
			c += 2;
		}else {
			if (ints[c] != undefined && ints[c+1] != undefined) {
				scoreRounds[i] = ints[c] + ints[c+1];
			}
			c += 2;
		}
	}
	for (var i = scoreRounds.length-1; i >= 0; i--) {
		if (scoreRounds[i] != " " && scoreRounds[i] != undefined) {
			for (var j = 0; j < i; j++) {
				scoreRounds[i] += scoreRounds[j];
			}
		}
	}

	// DETERMINO PUNTEGGIO TOTALE
	var latestCompleteRound = 9;
	for (; latestCompleteRound >= 0; latestCompleteRound--) {
		var latestScoreTotal = scoreRounds[latestCompleteRound];
		if (latestScoreTotal != " " && latestScoreTotal != undefined) break;
	}

	scoreTotal = (latestCompleteRound >= 0 ? scoreRounds[latestCompleteRound] : 0);

	if (gameOver) {
		endGame();
	}

	removerIsMoving = true;

	// debug
	//console.log(latestCompleteRound, latestScoreTotal);
	//console.log(scores);
}

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function render() {

	if (camera.position.z < LANE_SIZE_Z - 300) {
		ballPosX = ball.position.x;
	}
	if (cameraFollowsBall) {
		camera.position.set(
			ballPosX,
			ball.position.y > LANE_SIZE_Y + 20 ? ball.position.y + C11_HEIGHT : LANE_SIZE_Y + 20,
			camera.position.z < LANE_SIZE_Z - 300 ? ball.position.z + CAMERA_START_Z + 7.5 : LANE_SIZE_Z - 300
		);
	}

	remover.__dirtyPosition = true;
	remover.__dirtyRotation = true;
	remover.setLinearFactor(new THREE.Vector3(0, 0, 0));
	remover.setAngularFactor(new THREE.Vector3(0, 0, 0));

	if (removerIsMoving && !removerHasFinishedRotating) {
		if (remover.rotation.x >= -Math.PI / 2) {
			remover.rotation.x -= 0.04;
		} else {
			removerHasFinishedRotating = true;
		}
	} else if (removerIsMoving && removerHasFinishedRotating) {
		if (remover.position.z <= REMOVER_POS_Z + TRANSLATION_SIZE) {
			remover.position.z += 0.2;
		} else {
			removerIsMoving = false;
			setTimeout(function() {document.getElementById("center").innerHTML = innerHTMLString;}, 1000);
		}
	}
	// PHYSIJS SIMULATION
	scene.simulate();
	// Rotation of cannon
	c9.rotateZ(0.05);
	c10.rotateZ(-0.05);
	c19.rotateZ(-0.05);


	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

function onClickStartGame() {
	document.getElementById("audio").play();
	document.getElementById('startbutton').remove();
	document.getElementById('loading').innerHTML=
		'Loading...<br/><progress value="' +
		textureCounter + '" max="' + N_TEXTURES + '"/>';
 	preload();
}

function changeBallColor(color) {
	document.getElementById("green").classList.remove("ballimageclickactive");
	document.getElementById("red").classList.remove("ballimageclickactive");
	document.getElementById("blue").classList.remove("ballimageclickactive");
	event.target.classList.add("ballimageclickactive");
	ballColor = color;
}

var onLoad = function(tex) {
	document.getElementById('loading').innerHTML=
		'Loading...<br/><progress value="' +
		textureCounter + '" max="' + N_TEXTURES + '"/>';
	textureCounter++;
	if (textureCounter == N_TEXTURES) {
		initGame();
	}
}


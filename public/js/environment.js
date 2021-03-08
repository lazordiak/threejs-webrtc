let myMesh;

let rainDrop;
let rain;
let rainGeo;

VolumetricFire.texturePath = '../assets/fire/';

var fireWidth  = 2;
var fireHeight = 4;
var fireDepth  = 2;
var sliceSpacing = 0.5;

var clock = new THREE.Clock();

var fire;

var sound

function randomFromInterval(min, max) { // min and max included 
  return (Math.random() * (max - min + 1) + min);
}

function createEnvironment(scene,camera,listener,loader) {

  var skyDomeRadius = 1000.01;
  var sphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    skyRadius: { value: skyDomeRadius },
    env_c1: { value: new THREE.Color("#0d1a2f") },
    env_c2: { value: new THREE.Color("#0f8682") },
    noiseOffset: { value: new THREE.Vector3(100.01, 100.01, 100.01) },
    starSize: { value: 0.01 },
    starDensity: { value: 0.09 },
    clusterStrength: { value: 0.2 },
    clusterSize: { value: 0.2 },
    time: { value: 0 }
  },
  vertexShader: StarrySkyShader.vertexShader,
  fragmentShader: StarrySkyShader.fragmentShader,
  side: THREE.DoubleSide,
  });

  var sphereGeometry = new THREE.SphereGeometry(skyDomeRadius, 20, 20);
  var skyDome = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(skyDome);

  rainGeo = new THREE.Geometry();
  for(let i=0;i<15000;i++) {
    rainDrop = new THREE.Vector3(
      Math.random() * 400 -200,
      Math.random() * 500 - 250,
      Math.random() * 400 - 200
    );
    rainDrop.velocity = {};
    rainDrop.velocity = 0;
    rainGeo.vertices.push(rainDrop);
  }

  let rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
  });
  rain = new THREE.Points(rainGeo,rainMaterial);
  scene.add(rain);


  /*let texture = new THREE.TextureLoader().load("../assets/texture.png");
  let myGeometry = new THREE.SphereGeometry(3, 12, 12);
  let myMaterial = new THREE.MeshBasicMaterial({ map: texture });
  myMesh = new THREE.Mesh(myGeometry, myMaterial);
  myMesh.position.set(5, 2, 5);
  scene.add(myMesh);*/

  const planeGeo = new THREE.PlaneGeometry(600,50);
  const planeMat = new THREE.MeshStandardMaterial( {color: 0xffffff, side: THREE.FrontSide} );
  //const planeMat = new THREE.MeshLambertMaterial( {color: (16324F), side: THREE.DoubleSide} );
  const plane = new THREE.Mesh( planeGeo,planeMat );
  plane.position.x = -275;
  plane.rotation.x = - Math.PI / 2;
  scene.add( plane );

  /*const sphereGeo = new THREE.SphereGeometry();
  const sphereMat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  const sphere = new THREE.Mesh( sphereGeo, sphereMat );
  scene.add( sphere );*/

  let treePos = [];

  loadModel(scene);
  loadModel2(scene);
  loadRoad(scene);
  loadFire(scene);

  for (let i=0; i<1500; i++) {
    let treePosX = randomFromInterval(-20,-500);
    let treePosZ = randomFromInterval(-100,100);
    while (-260 < treePosX && treePosX < -240 && -10 < treePosZ && treePosZ < 10) {
      treePosX = randomFromInterval(-20,-500);
      treePosZ = randomFromInterval(-50,50);
    }
    treePos.push({x:treePosX,z:treePosZ});
    loadTrees(scene,treePosX,treePosZ);
  }

  scene.fog = new THREE.FogExp2("rgb(19, 41, 61)", .05);

  fire = new VolumetricFire(
    fireWidth,
    fireHeight,
    fireDepth,
    sliceSpacing,
    camera
  );

  scene.add( fire.mesh );
  // you can set position, rotation and scale
  // fire.mesh accepts THREE.mesh features
  fire.mesh.position.set(-250, fireHeight/1.8, 0 );

  const positionalAudio = new THREE.PositionalAudio( listener );

  loader.load( '../assets/fire.wav', function( buffer ) {
    positionalAudio.setBuffer( buffer );
    positionalAudio.setLoop(true);
    positionalAudio.setVolume(1.2);
    positionalAudio.setRefDistance( 20 );
    positionalAudio.play();
  });

  fire.mesh.add(positionalAudio);

}

///////////////////////////////////////////////////////////////
//END OF SETUP, HELPER FUNCTIONS AND UPDATE FUNCTION BEGIN HERE
///////////////////////////////////////////////////////////////

function updateEnvironment(scene) {
  // myMesh.position.x += 0.01;
  rainGeo.vertices.forEach(p => {
    p.velocity -= 0.1 + Math.random() * 0.1;
    p.y += p.velocity;
    if (p.y < -200) {
      p.y = 200;
      p.velocity = 0;
    }
  });
  rainGeo.verticesNeedUpdate = true;
  rain.rotation.y +=0.002;

  var elapsed = clock.getElapsedTime();
  fire.update( elapsed );
}

/*////////////////////////////////////////FIRE BABY!
updateFireVolume(scene) {

  let distSquared = this.camera.position.distanceToSquared(
    fire.mesh.position
  );

  if (distSquared > 500) {
    // console.log('setting vol to 0')
    audioEl.volume = 0;
  } else {
    // from lucasio here: https://discourse.threejs.org/t/positionalaudio-setmediastreamsource-with-webrtc-question-not-hearing-any-sound/14301/29
    let volume = Math.min(1, 10 / distSquared);
    audioEl.volume = volume;
    // console.log('setting vol to',volume)
  }
}*/

function loadModel(scene) {
  // model

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();

  new THREE.MTLLoader( manager )
    .setPath( '../assets/busstop/' )
    .load( 'bus.mtl', function ( materials ) {

      materials.preload();

      new THREE.OBJLoader( manager )
        .setMaterials( materials )
        .setPath( '../assets/busstop/' )
        .load( 'bus.obj', function ( object ) {

          //object.position.y = - 95;
          object.scale.set(.0015,.0015,.0015);
          object.rotation.x = - Math.PI / 2;
          object.position.set(5, 0, 5);
          scene.add( object );

        }, onProgress, onError );

    } );

}

function loadRoad(scene) {
  // model

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();

  new THREE.MTLLoader( manager )
    .setPath( '../assets/road/' )
    .load( 'CUPIC_ROAD.mtl', function ( materials ) {

      materials.preload();

      new THREE.OBJLoader( manager )
        .setMaterials( materials )
        .setPath( '../assets/road/' )
        .load( 'CUPIC_ROAD.obj', function ( object ) {

          //object.position.y = - 95;
          object.scale.set(.03,.003,.1);
          //object.rotation.x = - Math.PI / 2;
          object.position.set(-.75, .0, 0);
          scene.add( object );

        }, onProgress, onError );

    } );

}

function loadModel2(scene) {
  // model

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();

  new THREE.MTLLoader( manager )
    .setPath( '../assets/lamp/' )
    .load( 'lamp.mtl', function ( materials ) {

      materials.preload();

      new THREE.OBJLoader( manager )
        .setMaterials( materials )
        .setPath( '../assets/lamp/' )
        .load( 'lamp.obj', function ( object ) {

          //object.position.y = - 95;
          object.scale.set(.3,.3,.3);
          //object.rotation.x = - Math.PI / 2;
          object.position.set(3, 0, 0);
          scene.add( object );

        }, onProgress, onError );

    } );

}

function loadTrees(scene,posx,posz) {

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();

  new THREE.MTLLoader( manager )
    .setPath( '../assets/pinetree/' )
    .load( 'materials.mtl', function ( materials ) {

      materials.preload();

      new THREE.OBJLoader( manager )
        .setMaterials( materials )
        .setPath( '../assets/pinetree/' )
        .load( 'model.obj', function ( object ) {

          let treeScaleX = randomFromInterval(2.7,3.3);
          let treeScaleY = randomFromInterval(3.3,3.7);
          let treeScaleZ = randomFromInterval(2.7,3.3);
          //need to fix the math so that the y pos changes depending on scaling
          object.scale.set(treeScaleX,treeScaleY,treeScaleZ);
          object.position.set(posx, treeScaleY * 1.65, posz);
          scene.add( object );

        }, onProgress, onError );

    } );

}

function loadFire(scene) {
  // model

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();

  new THREE.MTLLoader( manager )
    .setPath( '../assets/fire/' )
    .load( 'PUSHILIN_campfire.mtl', function ( materials ) {

      materials.preload();

      new THREE.OBJLoader( manager )
        .setMaterials( materials )
        .setPath( '../assets/fire/' )
        .load( 'PUSHILIN_campfire.obj', function ( object ) {

          //object.position.y = - 95;
          object.scale.set(1.3,1.3,1.3);
          //object.rotation.x = - Math.PI / 2;
          object.position.set(-250, .7, 0);
          scene.add( object );

        }, onProgress, onError );

    } );

}

function loadTree(scene) {

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  const onError = function () { };

  const manager = new THREE.LoadingManager();

  new THREE.MTLLoader( manager )
    .setPath( '../assets/pinetree/' )
    .load( 'materials.mtl', function ( materials ) {

      materials.preload();

      new THREE.OBJLoader( manager )
        .setMaterials( materials )
        .setPath( '../assets/pinetree/' )
        .load( 'model.obj', function ( object ) {
          //need to fix the math so that the y pos changes depending on scaling
          object.scale.set(1,3,1);
          object.position.set(0,3* 1.65, 0);
          scene.add( object );

        }, onProgress, onError );

    } );

}
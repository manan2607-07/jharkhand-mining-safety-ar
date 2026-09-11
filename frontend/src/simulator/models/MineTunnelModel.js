/**
 * MineTunnelModel
 * Procedural 3D Underground Coal Mine Drift / Tunnel.
 * Generates steel arch support ribs, rugged coal seam rock walls,
 * overhead ventilation ducting, miner haulage track rails, and emergency exit signage.
 */

import * as THREE from 'three';

export class MineTunnelModel {
  static create(options = {}) {
    const tunnel = new THREE.Group();
    tunnel.name = 'MineTunnelModel';

    const length = options.length || 8;
    const width = options.width || 3.2;
    const height = options.height || 2.4;

    // Rock floor
    const floorGeo = new THREE.PlaneGeometry(width, length).rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181e24,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    tunnel.add(floor);

    // Left and right coal seam rock walls
    const wallGeo = new THREE.PlaneGeometry(length, height);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x11161b,
      roughness: 0.95,
      metalness: 0.05
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-width / 2, height / 2, 0);
    tunnel.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(width / 2, height / 2, 0);
    tunnel.add(rightWall);

    // Arch roof (Cylinder segment)
    const roofGeo = new THREE.CylinderGeometry(
      width / 2,
      width / 2,
      length,
      24,
      1,
      true,
      0,
      Math.PI
    );
    roofGeo.rotateZ(Math.PI / 2);
    roofGeo.rotateY(Math.PI / 2);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x11161b,
      roughness: 0.95,
      side: THREE.BackSide
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, height * 0.7, 0);
    tunnel.add(roof);

    // Steel Arch Support Ribs along tunnel length
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.6,
      metalness: 0.7
    });

    const numRibs = 5;
    for (let i = 0; i < numRibs; i++) {
      const zPos = -length / 2 + (length / (numRibs - 1)) * i;
      const rib = new THREE.Group();

      // Left leg
      const legGeo = new THREE.BoxGeometry(0.08, height, 0.08);
      const leftLeg = new THREE.Mesh(legGeo, ribMat);
      leftLeg.position.set(-width / 2 + 0.05, height / 2, 0);

      // Right leg
      const rightLeg = new THREE.Mesh(legGeo, ribMat);
      rightLeg.position.set(width / 2 - 0.05, height / 2, 0);

      // Arch top
      const archGeo = new THREE.TorusGeometry(width / 2 - 0.05, 0.04, 8, 24, Math.PI);
      const archTop = new THREE.Mesh(archGeo, ribMat);
      archTop.position.set(0, height * 0.75, 0);

      rib.add(leftLeg, rightLeg, archTop);
      rib.position.z = zPos;
      tunnel.add(rib);
    }

    // Overhead Yellow Ventilation Duct
    const ductGeo = new THREE.CylinderGeometry(0.24, 0.24, length, 20);
    ductGeo.rotateX(Math.PI / 2);
    const ductMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Safety colliery yellow
      roughness: 0.5,
      metalness: 0.1
    });
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.position.set(-width / 3, height * 0.85, 0);
    tunnel.add(duct);

    // Mine Haulage Track Rails on floor
    const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, length), railMat);
    leftRail.position.set(-0.35, 0.02, 0);
    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, length), railMat);
    rightRail.position.set(0.35, 0.02, 0);
    tunnel.add(leftRail, rightRail);

    // Sleepers (wooden ties)
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
    for (let i = 0; i < 12; i++) {
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.12), sleeperMat);
      sleeper.position.set(0, 0.015, -length / 2 + (length / 11) * i);
      tunnel.add(sleeper);
    }

    return tunnel;
  }
}

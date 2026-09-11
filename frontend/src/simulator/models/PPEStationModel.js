/**
 * PPEStationModel
 * Procedural 3D Virtual Miner Mannequin & PPE Inspection Station.
 * Built with Three.js primitives and materials, optimized for mobile WebGL performance.
 * Features 11 inspectable equipment points for statutory mining compliance training.
 */

import * as THREE from 'three';

export class PPEStationModel {
  /**
   * Build the complete PPE inspection station model
   * @param {object} [options]
   * @returns {THREE.Group}
   */
  static create(options = {}) {
    const station = new THREE.Group();
    station.name = 'PPEStationModel';

    // 1. Inspection Floor Stand
    const floorGeo = new THREE.CylinderGeometry(0.75, 0.8, 0.05, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.025;
    floor.receiveShadow = true;
    station.add(floor);

    // Hazard border ring on platform (yellow/black colliery hazard stripes)
    const ringGeo = new THREE.RingGeometry(0.68, 0.74, 32).rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.051;
    station.add(ring);

    // 2. Miner Mannequin Group
    const mannequin = new THREE.Group();
    mannequin.name = 'MinerMannequin';
    mannequin.position.set(0, 0.05, 0);

    // Base skin / inner material (slate/neutral mannequin finish)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.1
    });

    // --- Boots (Steel-Toed Colliery Footwear) ---
    const bootMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.5,
      metalness: 0.3
    });
    const steelCapMat = new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      roughness: 0.3,
      metalness: 0.8
    });

    // Left boot
    const leftBootGroup = new THREE.Group();
    leftBootGroup.name = 'Item_Boots_Left';
    const leftBootSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.24), bootMat);
    leftBootSole.position.set(-0.14, 0.04, 0.02);
    const leftBootToe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16), steelCapMat);
    leftBootToe.rotation.x = Math.PI / 2;
    leftBootToe.position.set(-0.14, 0.04, 0.1);
    leftBootGroup.add(leftBootSole, leftBootToe);
    leftBootGroup.userData = { ppeItem: 'boots' };
    mannequin.add(leftBootGroup);

    // Right boot
    const rightBootGroup = new THREE.Group();
    rightBootGroup.name = 'Item_Boots_Right';
    const rightBootSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.24), bootMat);
    rightBootSole.position.set(0.14, 0.04, 0.02);
    const rightBootToe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16), steelCapMat);
    rightBootToe.rotation.x = Math.PI / 2;
    rightBootToe.position.set(0.14, 0.04, 0.1);
    rightBootGroup.add(rightBootSole, rightBootToe);
    rightBootGroup.userData = { ppeItem: 'boots' };
    mannequin.add(rightBootGroup);

    // --- Legs & Heavy Work Trousers with Reflective Bands ---
    const pantMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f, // Deep colliery navy
      roughness: 0.85
    });
    const retroReflectiveMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Silver retroreflective
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.3
    });

    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 16), pantMat);
    leftLeg.position.set(-0.14, 0.42, 0);
    const leftReflectiveBand = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.06, 16), retroReflectiveMat);
    leftReflectiveBand.position.set(-0.14, 0.28, 0);
    mannequin.add(leftLeg, leftReflectiveBand);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65, 16), pantMat);
    rightLeg.position.set(0.14, 0.42, 0);
    const rightReflectiveBand = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.06, 16), retroReflectiveMat);
    rightReflectiveBand.position.set(0.14, 0.28, 0);
    mannequin.add(rightLeg, rightReflectiveBand);

    // --- Torso & High-Visibility Safety Jacket ---
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'Item_Reflective_Jacket';
    torsoGroup.userData = { ppeItem: 'reflective_jacket' };

    const hivisJacketMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // Fluorescent safety neon green / emerald
      roughness: 0.7,
      metalness: 0.1
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.26), hivisJacketMat);
    torso.position.set(0, 1.02, 0);
    torsoGroup.add(torso);

    // Horizontal reflective chest stripes
    const chestStripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.05, 0.27), retroReflectiveMat);
    chestStripe1.position.set(0, 1.12, 0);
    const chestStripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.05, 0.27), retroReflectiveMat);
    chestStripe2.position.set(0, 0.95, 0);
    torsoGroup.add(chestStripe1, chestStripe2);

    // Heavy duty miners utility belt & battery pack
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.28), beltMat);
    belt.position.set(0, 0.76, 0);
    const batteryPack = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    batteryPack.position.set(-0.16, 0.76, -0.14);
    torsoGroup.add(belt, batteryPack);
    mannequin.add(torsoGroup);

    // --- Arms & Gloves ---
    const armMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.8 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6, metalness: 0.2 }); // Leather safety orange

    // Left arm & glove
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.46, 16), armMat);
    leftArm.position.set(-0.28, 1.0, 0);
    leftArm.rotation.z = 0.15;

    const leftGloveGroup = new THREE.Group();
    leftGloveGroup.name = 'Item_Gloves_Left';
    leftGloveGroup.userData = { ppeItem: 'gloves' };
    const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.08), gloveMat);
    leftGlove.position.set(-0.33, 0.72, 0);
    leftGloveGroup.add(leftGlove);
    mannequin.add(leftArm, leftGloveGroup);

    // Right arm & glove
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.46, 16), armMat);
    rightArm.position.set(0.28, 1.0, 0);
    rightArm.rotation.z = -0.15;

    const rightGloveGroup = new THREE.Group();
    rightGloveGroup.name = 'Item_Gloves_Right';
    rightGloveGroup.userData = { ppeItem: 'gloves' };
    const rightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.08), gloveMat);
    rightGlove.position.set(0.33, 0.72, 0);
    rightGloveGroup.add(rightGlove);
    mannequin.add(rightArm, rightGloveGroup);

    // --- Neck & Head ---
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 16), baseMat);
    neck.position.set(0, 1.34, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), baseMat);
    head.position.set(0, 1.48, 0);
    mannequin.add(neck, head);

    // --- Safety Helmet (Hard Hat) ---
    const helmetGroup = new THREE.Group();
    helmetGroup.name = 'Item_Helmet';
    helmetGroup.userData = { ppeItem: 'helmet' };

    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Statutory Yellow safety helmet
      roughness: 0.3,
      metalness: 0.1
    });

    const helmetDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      helmetMat
    );
    helmetDome.position.set(0, 1.54, 0);

    const helmetBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32),
      helmetMat
    );
    helmetBrim.position.set(0, 1.53, 0.02);

    // Chin strap
    const strapMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 8, 24, Math.PI), strapMat);
    strap.rotation.x = Math.PI / 2 + 0.2;
    strap.position.set(0, 1.45, 0.02);

    helmetGroup.add(helmetDome, helmetBrim, strap);
    mannequin.add(helmetGroup);

    // --- Cap Lamp (Colliery Front Lamp) ---
    const capLampGroup = new THREE.Group();
    capLampGroup.name = 'Item_Cap_Lamp';
    capLampGroup.userData = { ppeItem: 'cap_lamp' };

    const lampHousingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const lampLensMat = new THREE.MeshBasicMaterial({ color: 0xfffbe6 });

    const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.04, 20), lampHousingMat);
    lampHousing.rotation.x = Math.PI / 2;
    lampHousing.position.set(0, 1.58, 0.17);

    const lampLens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), lampLensMat);
    lampLens.position.set(0, 1.58, 0.191);

    // Spotlight beam simulation
    const lampBeam = new THREE.SpotLight(0xfffbe6, 2.5, 5, Math.PI / 5, 0.4);
    lampBeam.position.set(0, 1.58, 0.19);
    lampBeam.target.position.set(0, 1.5, 2.5);
    mannequin.add(lampBeam.target);

    // Cap lamp power cord running down back to belt battery
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.56, -0.14),
      new THREE.Vector3(-0.06, 1.25, -0.15),
      new THREE.Vector3(-0.14, 0.85, -0.15)
    ]);
    const cordGeo = new THREE.TubeGeometry(cordCurve, 16, 0.006, 8, false);
    const cordMesh = new THREE.Mesh(cordGeo, new THREE.MeshBasicMaterial({ color: 0x0f172a }));

    capLampGroup.add(lampHousing, lampLens, lampBeam, cordMesh);
    mannequin.add(capLampGroup);

    // --- Eye Protection (Safety Goggles) ---
    const gogglesGroup = new THREE.Group();
    gogglesGroup.name = 'Item_Goggles';
    gogglesGroup.userData = { ppeItem: 'goggles' };

    const gogglesFrameMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 });
    const gogglesLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      transmission: 0.9
    });

    const gogglesFrame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.04), gogglesFrameMat);
    gogglesFrame.position.set(0, 1.5, 0.115);
    const gogglesLens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.01), gogglesLensMat);
    gogglesLens.position.set(0, 1.5, 0.138);

    gogglesGroup.add(gogglesFrame, gogglesLens);
    mannequin.add(gogglesGroup);

    // --- Hearing Protection (Earmuffs) ---
    const earmuffGroup = new THREE.Group();
    earmuffGroup.name = 'Item_Earmuffs';
    earmuffGroup.userData = { ppeItem: 'earmuffs' };

    const muffMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }); // High-visibility red muffs
    const leftMuff = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), muffMat);
    leftMuff.rotation.z = Math.PI / 2;
    leftMuff.position.set(-0.135, 1.48, 0);

    const rightMuff = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16), muffMat);
    rightMuff.rotation.z = Math.PI / 2;
    rightMuff.position.set(0.135, 1.48, 0);

    earmuffGroup.add(leftMuff, rightMuff);
    mannequin.add(earmuffGroup);

    // --- Dust Respirator (Dual-Cartridge Particulate Mask) ---
    const respiratorGroup = new THREE.Group();
    respiratorGroup.name = 'Item_Respirator';
    respiratorGroup.userData = { ppeItem: 'respirator' };

    const respBodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const filterMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 }); // P100 pink/magenta filters

    // Face cup
    const cup = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.09, 16), respBodyMat);
    cup.rotation.x = Math.PI / 2 - 0.2;
    cup.position.set(0, 1.42, 0.13);

    // Dual filter cartridges on left & right cheeks
    const leftFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16), filterMat);
    leftFilter.rotation.y = Math.PI / 4;
    leftFilter.position.set(-0.065, 1.4, 0.12);

    const rightFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.03, 16), filterMat);
    rightFilter.rotation.y = -Math.PI / 4;
    rightFilter.position.set(0.065, 1.4, 0.12);

    respiratorGroup.add(cup, leftFilter, rightFilter);
    mannequin.add(respiratorGroup);

    station.add(mannequin);

    // 3. Inspection Stand with Checklist Board
    const stand = new THREE.Group();
    stand.name = 'ChecklistStand';
    stand.position.set(0.5, 0, 0.2);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.95, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 })
    );
    pole.position.y = 0.475;

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.38, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0f2d4a })
    );
    board.position.set(0, 0.95, 0);
    board.rotation.y = -Math.PI / 6;

    // Header sign
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sheet.position.set(0, 0.95, 0.011);
    sheet.rotation.y = -Math.PI / 6;

    stand.add(pole, board, sheet);
    station.add(stand);

    return station;
  }
}

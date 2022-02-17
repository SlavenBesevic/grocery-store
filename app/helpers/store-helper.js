const { Store } = require('../models');

module.exports.createStores = async () => {
  const srbija = await new Store({
    name: 'Srbija',
    type: 'office',
  }).save();

  const [vojvodina, beograd] = await Promise.all([
    new Store({
      name: 'Vojvodina',
      type: 'office',
      parent: srbija._id,
    }).save(),
    new Store({
      name: 'Beograd',
      type: 'office',
      parent: srbija._id,
    }).save()
  ]);

  const [severnobacki, juznobacki, noviBeograd, vracar] = await Promise.all([
    new Store({
      name: 'Severnobački okrug',
      type: 'office',
      parent: vojvodina._id,
    }).save(),
    new Store({
      name: 'Južnobački okrug',
      type: 'office',
      parent: vojvodina._id,
    }).save(),
    new Store({
      name: 'Novi Beograd',
      type: 'office',
      parent: beograd._id,
    }).save(),
    new Store({
      name: 'Vračar',
      type: 'office',
      parent: beograd._id,
    }).save(),
  ]);

  const [subotica, noviSad, bezanija, neimar, crveniKrst] = await Promise.all([
    new Store({
      name: 'Subotica',
      type: 'office',
      parent: severnobacki._id,
    }).save(),
    new Store({
      name: 'Novi sad',
      type: 'office',
      parent: juznobacki._id,
    }).save(),
    new Store({
      name: 'Bežanija',
      type: 'office',
      parent: noviBeograd._id,
    }).save(),
    new Store({
      name: 'Neimar',
      type: 'office',
      parent: vracar._id,
    }).save(),
    new Store({
      name: 'Crveni krst',
      type: 'office',
      parent: vracar._id,
    }).save(),
  ]);

  const [, detelinara, liman] = await Promise.all([
    new Store({
      name: 'Radnja 1',
      type: 'store',
      parent: subotica._id,
    }).save(),
    new Store({
      name: 'Detelianra',
      type: 'office',
      parent: noviSad._id,
    }).save(),
    new Store({
      name: 'Liman',
      type: 'office',
      parent: noviSad._id,
    }).save(),
    new Store({
      name: 'Radnja 6',
      type: 'store',
      parent: bezanija._id,
    }).save(),
    new Store({
      name: 'Radnja 7',
      type: 'store',
      parent: neimar._id,
    }).save(),
    new Store({
      name: 'Radnja 8',
      type: 'store',
      parent: crveniKrst._id,
    }).save(),
    new Store({
      name: 'Radnja 9',
      type: 'store',
      parent: crveniKrst._id,
    }).save(),
  ]);

  await Promise.all([
    new Store({
      name: 'Radnja 2',
      type: 'store',
      parent: detelinara._id,
    }).save(),
    new Store({
      name: 'Radnja 3',
      type: 'store',
      parent: detelinara._id,
    }).save(),
    new Store({
      name: 'Radnja 4',
      type: 'store',
      parent: liman._id,
    }).save(),
    new Store({
      name: 'Radnja 5',
      type: 'store',
      parent: liman._id,
    }).save(),
  ]);

  return Store.find().lean();
}
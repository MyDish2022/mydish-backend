const objectsEqual = (o1, o2) =>
  typeof o1 === "object" && Object.keys(o1).length > 0
    ? Object.keys(o1).length === Object.keys(o2).length &&
      Object.keys(o1).every((p) => objectsEqual(o1[p], o2[p]))
    : o1 === o2;
const arraysEquals = (arr, arr2) => {
  let a1 = arr.map((item) => {
    return {
      name: item.name,
      price: item.price,
    };
  });
  let a2 = arr2.map((item) => {
    return {
      name: item.name,
      price: item.price,
    };
  });
  return (
    a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]))
  );
};
const sumArray = (arr) => {
  let sum = 0;
  arr.map((item) => {
    sum += item.price;
  });
  return sum;
};
module.exports = { arraysEquals, sumArray };

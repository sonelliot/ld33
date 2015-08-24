
export function* range(start, end, step) {
  while (start < end) {
    yield start;
    start += step;
  }
}

// export function* perm(s1, s2, f) {
//   for (let e1 of s1) {
//     for (let e2 of s2) {
//       yield f(e1, e2);
//     }
//   }
// }

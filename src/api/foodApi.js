/**
 * 获取食品列表
 * @param {*} type 1=荤菜，2=素材 
 * @returns 
 */
export function getFoodList(type) {
  const food = JSON.parse(localStorage.getItem('food') || '{}')
  return food[type]
}
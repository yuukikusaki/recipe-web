/**
 * 根据权重对数组进行随机排序
 * @param {*} arr 数组
 * @returns 
 */
export function weightedShuffle(arr) {
  // 创建一个数组的副本，用于返回结果  
  const shuffledArr = JSON.parse(JSON.stringify(arr));

  // 数组的总权重  
  let totalWeight = arr.reduce((sum, item) => sum + item.weight, 0);

  // 遍历数组的每个元素  
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    // 生成一个随机数，范围在0到当前总权重之间  
    let randomIndex = Math.floor(Math.random() * totalWeight);
    let cumulativeWeight = 0;

    // 找到随机数对应的元素  
    for (let j = 0; j < shuffledArr.length; j++) {
      cumulativeWeight += shuffledArr[j].weight;

      // 如果累积权重大于或等于随机数，则交换元素  
      if (cumulativeWeight >= randomIndex) {
        [shuffledArr[i], shuffledArr[j]] = [shuffledArr[j], shuffledArr[i]];
        break;
      }
    }

    // 减去已选择元素的权重，更新总权重  
    totalWeight -= shuffledArr[i].weight;
  }

  return shuffledArr.reverse();
}

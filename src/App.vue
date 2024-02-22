<template>
  <div class="content">
    <div>
      <input type="file" @change="handleInput">
      <button @click="createRecipe">生成食谱</button>
      <button @click="handleExport">导出食谱</button>
    </div>
    <a-table :dataSource="dataSource" :columns="columns" />
    <!-- <a-list :grid="{ gutter: 0, column: 8 }" :data-source="recipeList">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-card :title="item.day">
            <div>午餐</div>
            <div v-for="lunch in item.lunch" :key="lunch.name">{{ lunch.name }}</div>
            <div>晚餐</div>
            <div v-for="dinner in item.dinner" :key="dinner.name">{{ dinner.name }}</div>
          </a-card>
        </a-list-item>
      </template>
    </a-list> -->
    <!-- <div v-for="item in recipeList" :key="item.day">
      <div>
        <text>{{ item.day }}</text>
      </div>
      <div>
        <div>
          <text class="title">午餐：</text>
        </div>
        <text class="title">{{ item.lunch.map(v => v.name).join() }}</text>
      </div>
      <div>
        <div>
          <text class="title">晚餐:</text>
        </div>
        <text class="title">{{ item.dinner.map(v => v.name).join() }}</text>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, toRaw } from 'vue'
import { weightedShuffle } from '@/utils/utils'
import { getFoodFromExcel } from '@/utils/food'
import { getFoodList } from '@/api/foodApi'
import {
  List as AList,
  ListItem as AListItem,
  Card as ACard,
  Table as ATable
} from 'ant-design-vue'


// 生成这一周的数据
const weekList = [
  { day: '星期一', meatNum: 4, vegetableNum: 4 },
  { day: '星期二', meatNum: 4, vegetableNum: 4 },
  { day: '星期三', meatNum: 4, vegetableNum: 4 },
  { day: '星期四', meatNum: 4, vegetableNum: 4 },
  { day: '星期五', meatNum: 4, vegetableNum: 4 },
  { day: '星期六', meatNum: 3, vegetableNum: 3 },
  { day: '星期日', meatNum: 3, vegetableNum: 3 },
]

const recipeList = ref([])


const columns = [
  { title: '', key: 'title', dataIndex: 'title' },
  { title: '星期一', key: 'day1', dataIndex: 'day1' },
  { title: '星期二', key: 'day2', dataIndex: 'day2' },
  { title: '星期三', key: 'day3', dataIndex: 'day3' },
  { title: '星期四', key: 'day4', dataIndex: 'day4' },
  { title: '星期五', key: 'day5', dataIndex: 'day5' },
  { title: '星期六', key: 'day6', dataIndex: 'day6' },
  { title: '星期日', key: 'day7', dataIndex: 'day7' },
]
const dataSource = ref([])

// 根据每周每天的数量生成菜单
const createRecipe = () => {
  // 获取菜单
  // 荤菜列表
  const meatList = getFoodList('meatList')
  // 素材列表
  const vegetableList = getFoodList('vegetableList')

  // 给菜单随机排序
  const shuffleMeatList = weightedShuffle(meatList)
  const shuffleVegetableList = weightedShuffle(vegetableList)

  const list = []
  weekList.forEach(v => {
    list.push({
      day: v.day,
      lunch: [...shuffleMeatList.splice(0, v.meatNum), ...shuffleVegetableList.splice(0, v.vegetableNum)],
      dinner: [...shuffleMeatList.splice(0, v.meatNum), ...shuffleVegetableList.splice(0, v.vegetableNum)]
    })
  });

  recipeList.value = list;

  const maxMeat = Math.max(...weekList.map(v => v.meatNum))
  const maxvegetable = Math.max(...weekList.map(v => v.meatNum))
  console.log(maxMeat, maxvegetable);
  const list2 = [
    { title: '', ...Object.fromEntries(list.map((v, i) => ([[`day${i + 1}`], v.day]))) },
  ]

  for (let j = 0; j < maxMeat; j++) {
    list2.push({
      title: '午饭', ...Object.fromEntries(list.map((v, i) => ([`day${i + 1}`, v.lunch[j].name]))),
    })
  }
  for (let j = 0; j < maxvegetable; j++) {
    list2.push({
      title: '晚饭', ...Object.fromEntries(list.map((v, i) => ([`day${i + 1}`, v.dinner[j].name]))),
    })
  }
  console.log('list2', list2);
  dataSource.value = list2

}


console.log(recipeList.value);

// 导入文件
const handleInput = (data) => {
  console.log(data.target.files[0]);
  getFoodFromExcel(data.target.files[0])
}

const handleExport = () => {
  exportFoodExcel(toRaw(recipeList.value))
}

</script>

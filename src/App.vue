<template>
  <div>
    <a-row :gutter="16">
      <a-col :span="8">
        <input type="file" @change="handleInput">
        <a-form :model="formState" :label-col="{ style: { width: '100px' } }">
          <a-form-item label="荤菜数量">
            <a-input-number v-model:value="formState.meatNum" placeholder="请输入荤菜数量" />
          </a-form-item>
          <a-form-item label="素菜数量">
            <a-input-number v-model:value="formState.vegetableNum" placeholder="请输入素菜数量" />
          </a-form-item>
          <a-form-item label="假日荤菜数量">
            <a-input-number v-model:value="formState.meatNumHoliday" placeholder="请输入荤菜数量" />
          </a-form-item>
          <a-form-item label="假日素菜数量">
            <a-input-number v-model:value="formState.vegetableNumHoliday" placeholder="请输入素菜数量" />
          </a-form-item>
          <a-form-item>
            <a-button @click="createRecipe">生成食谱</a-button>
            <a-button type="primary" @click="handleExport">导出食谱</a-button>
          </a-form-item>
        </a-form>

      </a-col>
      <a-col :span="16">
        <a-table size="small" :dataSource="dataSource" :columns="columns" :pagination="false" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, reactive, ref, toRaw } from 'vue'
import { weightedShuffle } from '@/utils/utils'
import { getFoodFromExcel, exportFoodExcel } from '@/utils/food'
import { getFoodList } from '@/api/foodApi'
import {
  Table as ATable,
  Row as ARow,
  Col as ACol,
  Form as AForm,
  FormItem as AFormItem,
  InputNumber as AInputNumber,
  Button as AButton
} from 'ant-design-vue'


const formState = reactive({
  meatNum: 4,
  vegetableNum: 4,
  meatNumHoliday: 4,
  vegetableNumHoliday: 4
})

const maxDishNum = computed(() =>
  Math.max(formState.meatNum, formState.meatNumHoliday) + Math.max(formState.vegetableNum, formState.vegetableNumHoliday
  ))


// 生成这一周的数据
const weekList = [
  { day: '星期一', isHoliday: false, meatNum: 0, vegetableNum: 0 },
  { day: '星期二', isHoliday: false, meatNum: 0, vegetableNum: 0 },
  { day: '星期三', isHoliday: false, meatNum: 0, vegetableNum: 0 },
  { day: '星期四', isHoliday: false, meatNum: 0, vegetableNum: 0 },
  { day: '星期五', isHoliday: false, meatNum: 0, vegetableNum: 0 },
  { day: '星期六', isHoliday: true, meatNum: 0, vegetableNum: 0 },
  { day: '星期日', isHoliday: true, meatNum: 0, vegetableNum: 0 },
]

const recipeList = ref([])


const columns = [
  {
    title: '', key: 'title', dataIndex: 'title',
    customCell: (_, index) => ({
      rowSpan: index === 0 || index === maxDishNum.value ? maxDishNum.value : 0
    })
  },
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
    // 获取荤素数量
    const meatNum = v.isHoliday ? formState.meatNumHoliday : formState.meatNum
    const vegetableNum = v.isHoliday ? formState.vegetableNumHoliday : formState.vegetableNum

    list.push({
      day: v.day,
      lunch: [...shuffleMeatList.splice(0, meatNum), ...shuffleVegetableList.splice(0, vegetableNum)],
      dinner: [...shuffleMeatList.splice(0, meatNum), ...shuffleVegetableList.splice(0, vegetableNum)]
    })
  });

  createTableData(list)

  recipeList.value = list;

}

const createTableData = (foodList) => {
  console.log(formState.meatNum, formState.meatNumHoliday);
  const maxMeat = Math.max(formState.meatNum, formState.meatNumHoliday)
  const maxVegetable = Math.max(formState.vegetableNum, formState.vegetableNumHoliday)
  console.log(maxMeat, maxVegetable);
  const list = []

  // 午饭
  for (let j = 0; j < maxMeat + maxVegetable; j++) {
    list.push({
      title: '午饭', ...Object.fromEntries(foodList.map((v, i) => ([`day${i + 1}`, v.lunch[j]?.name]))),
    })
  }
  // 晚饭
  for (let j = 0; j < maxMeat + maxVegetable; j++) {
    list.push({
      title: '晚饭', ...Object.fromEntries(foodList.map((v, i) => ([`day${i + 1}`, v.dinner[j]?.name]))),
    })
  }
  dataSource.value = list
}


// 导入文件
const handleInput = (data) => {
  console.log(data.target.files[0]);
  getFoodFromExcel(data.target.files[0])
}

const handleExport = () => {
  if (dataSource.value.length === 0) {
    alert('请先生成食谱')
    return false
  }
  const header = columns.map(v => v.title)

  const mergeCell = [
    // 午饭
    { s: { r: 1, c: 0 }, e: { r: maxDishNum.value, c: 0 } },
    // 晚饭
    { s: { r: maxDishNum.value + 1, c: 0 }, e: { r: maxDishNum.value * 2, c: 0 } } // 注意行号是从0开始的，所以 A10 对应的是第9行  

  ]
  exportFoodExcel(header, toRaw(dataSource.value), mergeCell)
}

</script>

import * as XLSX from 'xlsx'
import dayjs from 'dayjs'

/**
 * 解析文件
 * @param {*} file 文件
 * @returns 
 */
const readExcel = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(false);
    if (!/\.(xls|xlsx)$/.test(file.name.toLowerCase())) {
      alert("上传格式不正确，请上传xls或者xlsx格式");
      return reject(false)
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheet2JSONOpts = {
        defval: "", //给defval赋值为空的字符串
      };
      const sheet1 = workbook.SheetNames[0]; //取第一张表
      //生成json表格内容
      const ws1 = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet1],
        sheet2JSONOpts
      );

      const sheet2 = workbook.SheetNames[1]; //取第二张表
      //生成json表格内容
      const ws2 = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet2],
        sheet2JSONOpts
      );

      // 处理工作簿对象  
      // console.log(ws1, ws2);
      resolve([ws1, ws2])
    };
    reader.readAsArrayBuffer(file);
  })
}

// 初始化食材
const initFood = (list) => {
  return list.map(v => ({
    name: v['名称'],
    weight: 1,
    createTime: new Date().toLocaleString()
  }))
}


export async function getFoodFromExcel(file) {
  // 获取食谱
  const [ws1, ws2] = await readExcel(file)
  // 初始化食谱
  const meatList = initFood(ws1)
  const vegetableList = initFood(ws2)

  // 保存食谱到本地
  localStorage.setItem('food', JSON.stringify({ meatList, vegetableList }))
}


export function exportFoodExcel(header, data, mergeCell = []) {

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  header.forEach((v, index) => {
    const columnLetter = XLSX.utils.encode_col(index); // 将列索引转换为 Excel 列名（A, B, C, ...）  
    // 设置标题行的单元格（第一行）  
    worksheet[`${columnLetter}1`] = { t: 's', v };
  });

  if (mergeCell.length > 0) {
    worksheet['!merges'] = mergeCell
  }

  XLSX.utils.book_append_sheet(workbook, worksheet);
  XLSX.writeFile(workbook, `${dayjs(new Date()).format('YYYY-MM-DD')}菜谱.xlsx`)
}
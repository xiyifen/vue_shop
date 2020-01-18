<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateCatigoryDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <zk-table
        class="zk-table"
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
      >
        <!-- 分类名称 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-check" style="color: lightgreen;" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-close" style="color: red;" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" type="success" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag size="mini" type="info" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else-if="scope.row.cat_level==2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operation" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </zk-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addCateDialogVisible"
      width="30%"
      @close="addCatedialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        ref="cateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="添加分类" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="cascaderValue"
            :options="parentCategoryList"
            :props="cascaderProps"
            @change="handleChange"
            expand-trigger="hover"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 查询商品分类列表参数
    return {
      queryinfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      categoryList: [],
      // 总数
      total: 0,
      // 为表格定义列名
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template", // 将当前列定义为模板列
          template: "isOk" // 这一列使用的模板名称
        },
        {
          label: "排序",
          type: "template", // 将当前列定义为模板列
          template: "order" // 这一列使用的模板名称
        },
        {
          label: "操作",
          type: "template", // 将当前列定义为模板列
          template: "operation" // 这一列使用的模板名称
        }
      ],
      // 是否显示添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表番对象
      addCateForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: 0
      },
      // 表单验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      // 一二级分类数据
      parentCategoryList: [],
      // 级联选择器配置对象
      cascaderProps: {
        // 刺激菜单的展开方式和是否允许选择任意一级的选项
        // 的属性在新版本的elementui中已放到这里。
        // expandTrigger: 'hover',
        // checkStrictly: true
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 需要设置为数组
      cascaderValue: []
    };
  },
  created() {
    this.getCategoryList();
  },
  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryinfo
      });
      if (res.meta.status != 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.categoryList = res.data.result;
      this.total = res.data.total;
    },
    // 监听 pagesize 的值
    handleSizeChange(newsize) {
      this.queryinfo.pagesize = newsize;
      this.getCategoryList();
    },
    // 监听 pagenum  的值
    handleCurrentChange(newSize) {
      this.queryinfo.pagenum = newSize;
      this.getCategoryList();
    },
    // 点击按钮，弹出添加分类对话框
    showAddCateCatigoryDialog() {
      // 先加载父级分类数据
      this.getParentCategoryList();
      // 再 显示对话框
      this.addCateDialogVisible = true;
    },
    // 获取前两级父级分类列表的数据
    async getParentCategoryList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表数据失败!");
      }
      this.parentCategoryList = res.data;
      console.log(this.parentCategoryList);
    },
    handleChange() {
      if (this.cascaderValue.length > 0) {
        // 添加分类的父id
        this.addCateForm.cat_pid = this.cascaderValue[
          this.cascaderValue.length - 1
        ];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.cascaderValue.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //  点击提交分类
    addCate() {
      this.$refs.cateFormRef.validate(async value => {
        if (value) {
          const { data: res } = await this.$http.post(
            "categories",
            this.addCateForm
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加分类失败");
          }

          this.$message.success("添加分类成功");
          this.getCategoryList();
          this.addCateDialogVisible = false;
        }
      });
    },
    // 监听对话框的关闭
    addCatedialogClosed() {
      this.$refs.cateFormRef.resetFields();
      this.cascaderValue = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    }
  }
};
</script>

<style lang="less" scoped>
.zk-table {
  // margin-top: 15px;
  // margin-bottom: 15px;
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>>

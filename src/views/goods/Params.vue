<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" :closable="false" type="warning"></el-alert>
      <!-- 级联选择器 -->
      <el-row class="params_opt">
        <el-col>
          <span>
            选择商品分类：
            <el-cascader
              expand-trigger="hover"
              :options="categoryList"
              :props="cascaderProps"
              v-model="selectCateKeys"
              @change="handleChange"
            ></el-cascader>
          </span>
        </el-col>
      </el-row>

      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="isShowDialog"
            class="addAttri"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环展示属性 -->
                <el-tag
                  class="param-tag"
                  closable @close="deleteAttrVals(i,scope.row)"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="isShowDialog"
            class="addAttri"
          >添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环展示属性 -->
                <el-tag
                  class="param-tag"
                  closable @close="deleteAttrVals(i,scope.row)"
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称" width="180"></el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="dialogVisible"
      width="30%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRule"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRule"
        ref="editFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="参数名称" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      categoryList: [],
      // 级联选择器配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择器当前被选中的值数组  cat_id
      selectCateKeys: [],
      activeName: "many",
      //   动态属性列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 添加属性对话框是否关闭
      dialogVisible: false,
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 添加表单数据的对象
      addForm: {
        attr_name: ""
      },
      // 表单验证
      addFormRule: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      // 编辑表单数据的对象
      editForm: {},
      editFormRule: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
    };
  },
  created() {
    this.getCategoryList();
  },
  computed: {
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === "many") {
        return "动态属性";
      } else if (this.activeName === "only") {
        return "静态属性";
      }
    }
  },
  methods: {
    // 获取分类列表
    async getCategoryList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类列表数据失败");
      }
      this.categoryList = res.data;
    },
    // 监听级联选择器被选中值的变化
    async handleChange() {
      this.getParamsData();
    },
    // 监听标签页
    handleTabClick() {
      this.getParamsData();
      console.log(this.activeName);
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 只能选择第三级分类
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = [];
        this.manyTableData=[];
        this.onlyTableData=[];
        return;
      }
      // 否则选中的是第三级分类
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败");
      }

      // 属性值分割,转换为数组类型
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? 
        item.attr_vals.split(" ") : [];
        // 为每一行添加 控制文本框的显示与隐藏属性
        item.inputVisible=false;
        // 文本框中输入的值
        item.inputValue='';
      });

      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      console.log("many=", this.manyTableData);
      console.log("only= ", this.onlyTableData);
      console.log("sele", this.selectCateKeys);
    },
    // 点击按钮是否显示对话框
    isShowDialog() {
      this.dialogVisible = true;
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }
          );
          if (res.meta.status !== 201) {
            return this.$message.error("添加参数失败");
          }
          this.$message.success("添加属性成功");
          this.getParamsData();
          this.dialogVisible = false;
        }
      });
    },
    // 监听编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击编辑按钮控制显示与隐藏
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取属性失败");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 提交更改过后的属性
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.editForm.attr_sel
            }
          );
          if (res.meta.status !== 200) {
            return this.$message.error("更新属性失败");
          }
          this.$message.success("更新属性成功");
          this.getParamsData();
          this.editDialogVisible = false;
        }
      });
    },
    // 删除属性
    async removeParams(attr_id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该属性, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);

      if (confirmRes !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      this.getParamsData();
    },

    // 保存参数项
    async saveAttrVals(row){
      const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
      {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      });
      
      if(res.meta.status!==200){
        return this.$message.error("修改参数项失败");
      }
      this.$message.success("修改参数项成功");
    },
    // 文本框失去焦点，按下回车键都会触发
     handleInputConfirm(row){
      if(row.inputValue.trim().length===0){
        row.inputValue='';
        row.inputVisible=false;
        return;
      }
      // 用户输入了有效值，需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue='';
      row.inputVisible=false;

      this.saveAttrVals(row);
      
    },
    // 求换到输入文本框状态
    showInput(row){
      row.inputVisible=true;
      // nextTick方法的作用：当页面上元素被重新渲染之后，
      // 才会调用函数中的代码。
      this.$nextTick(_ => {
        // 让文本框自动自动获得焦点
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除参数项
    deleteAttrVals(i,row){
      row.attr_vals.pop(i,1);
      this.saveAttrVals(row);
    }
  }
};
</script>

<style lang="less" scoped>
.params_opt {
  margin: 15px 0;
}

.addAttri {
  margin-bottom: 12px;
}
.param-tag {
  margin-right: 10px;
}
.input-new-tag{
  width: 100px;
}
</style>>

<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->

      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRule"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs标签页 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cascaderProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框区域 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="val" v-for="(val,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersData"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器区域 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" class="previewDialog">
      <img :src="previewUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>

import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRule: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      // 商品分类列表
      cateList: [],
      cascaderProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 图片上传地址
      uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
      // 上传组件请求头数据
      headersData: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 图片预览地址
      previewUrl: '',
      // 控制图片预览对话框的实现与隐藏
      previewVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return;
      }
    },
    beforeLeave(activeName, oldActiveName) {
      // console.log("即将离开的标签页:",oldActiveName);
      // console.log("即将进入的标签页:",activeName);
      // return false;
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.info("请先选择商品分类");
        return false;
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex);
      // 商品参数的tab页被点击，开始查询动态参数数据
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数失败");
        }
        // console.log(res.data);
        // 将attr_vals 转化为数组格式
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        console.log("manyTableData=",this.manyTableData);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败");
        }
        // console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 图片预览
    handlePreview(file) {
      console.log(file);
      this.previewUrl = file.response.data.url;
      this.previewVisible=true;
    },
    // 图片移除
    handleRemove(file) {
      // console.log(file);
      // 1. 获取要移除的文件路径
      const picPath = file.response.data.tmp_path;
      // 从pics数组中，找到要移除文件的路径所在的索引
      const i = this.addForm.pics.findIndex(x => x.pic === picPath);
      // 从pics数组中删除图片信息对象
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 图片上传成功时触发
    handleSuccess(response) {
      // console.log(response);
      // 拼接得到图片对象
      const pictureInfo = {
        pic: response.data.tmp_path
      };
      this.addForm.pics.push(pictureInfo);
      console.log(this.addForm);
    },
    addGoods(){
      this.$refs.addFormRef.validate(async valid=>{
        if(!valid){
          return this.$message.error("请填写必要的表单项");
        }
        // 执行添加的业务逻辑
        // 直接修改goods_cat属性会将数组类型转为字符串类型，
        // 导致错误，所有需要深拷贝，在拷贝的对象上操作
        // this.addForm.goods_cat=this.addForm.goods_cat.join(",");
        const form=_.cloneDeep(this.addForm);
        form.goods_cat=form.goods_cat.join(",")

        // 处理动态参数
        this.manyTableData.forEach(item=>{
          const newInfo={
            "attr_id": item.attr_id,
            "attr_value": item.attr_vals.join(" ")
          }
          this.addForm.attrs.push(newInfo);
        })
        // 处理静态属性
        this.onlyTableData.forEach(item=>{
           const newInfo={
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo);
        })
        form.attrs=this.addForm.attrs;
        // 发起添加请求
        const {data:res}=await this.$http.post("goods",form);
        if(res.meta.status!==201){
          return this.$message.error("添加商品失败");
        }

        this.$message.success("添加商品成功");
        this.$router.push("/goods");
      })
    }
  }
};
</script>

<style lang="less" scoped>
.el-steps {
  margin-top: 15px;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewDialog{
  width: 100%;
}

.btnAdd{
  margin-top: 10px;
}
</style>>

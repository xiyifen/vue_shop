<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="400px"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay==='1'">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="200px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 地区对话框 -->
    <el-dialog title="提示" :visible.sync="addressVisible" @close="addressDialogClosed" width="30%">
      <el-form
        :model="addressForm"
        :rules="addressFormRule"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="cascaderProps"
            @change="handleChange"
            expand-trigger="hover"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 快递进度区域 -->
    <el-dialog title="提示" :visible.sync="progressVisible" width="30%">
      <!-- 时间轴 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "assets/js/citydata.js";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单数据
      orderlist: [],
      // 控制address对话框的显示与隐藏
      addressVisible: false,
      // 快递进度
      progressVisible: false,
      addressForm: {
        address1: [],
        address2: ""
      },
      addressFormRule: {
        address1: [
          { required: true, message: "请输入收获地址", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" }
        ]
      },
      cityData,
      cascaderProps: {
        label: "label",
        value: "value",
        children: "children"
      },
      // 物流信息
      progressInfo: []
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败");
      }

      this.total = res.data.total;
      this.orderlist = res.data.goods;
      // console.log(res.data);
    },
    // 分页大小的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 当前页的变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 展示修改地址的对话框
    showBox() {
      this.addressVisible = true;
    },
    handleChange() {
      console.log("change");
    },
    addressDialogClosed() {
      console.log("close");
      this.$refs.addressFormRef.resetFields();
    },
    async showProgressBox() {
      this.progressVisible = true;
      const { data: res } = await this.$http.get("/kuaidi/70365716896101");
      if (res.meta.status !== 200) {
        return this.$message.error("物流查询失败");
      }
      this.$message.success("物流查询成功");
      console.log(res.data);
      this.progressInfo=res.data;
    }
  }
};
</script>

<style lang="less" scoped>

    @import '../../plugins/timeline/timeline.css';
    @import '../..//plugins/timeline-item/timeline-item.css';

.el-cascader {
  width: 100%;
}
</style>

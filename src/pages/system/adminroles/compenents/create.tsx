import React, { useState, useEffect } from "react";
import { Drawer, Select, Space, Button, Form, Input, message } from "antd";
import styles from "./create.module.less";
import { adminRole } from "../../../../api/index";

interface PropInterface {
  open: boolean;
  onCancel: () => void;
}

export const SystemAdminrolesCreate: React.FC<PropInterface> = ({
  open,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<any>([]);
  const [actions, setActions] = useState<any>([]);

  useEffect(() => {
    getParams();
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      name: "",
      permission_ids: [],
      action_ids: [],
    });
  }, [form, open]);

  const getParams = () => {
    adminRole.createAdminRole().then((res: any) => {
      const arr = [];
      const arr2 = [];
      let actions = res.data.perm_action.action;
      let permissions = res.data.perm_action.data;
      for (let i = 0; i < permissions.length; i++) {
        arr.push({
          label: permissions[i].group_name + "-" + permissions[i].name,
          value: permissions[i].id,
        });
      }
      for (let j = 0; j < actions.length; j++) {
        arr2.push({
          label: actions[j].group_name + "-" + actions[j].name,
          value: actions[j].id,
        });
      }
      setPermissions(arr);
      setActions(arr2);
    });
  };

  const onFinish = (values: any) => {
    let pids = [];
    let aids = [];
    if (values.permission_ids) {
      pids = values.permission_ids;
    }
    if (values.action_ids) {
      aids = values.action_ids;
    }
    const params = aids.concat(pids);
    adminRole.storeAdminRole(values.name, params).then((res: any) => {
      message.success("保存成功！");
      onCancel();
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <Drawer
        title="新建角色"
        onClose={onCancel}
        maskClosable={false}
        open={open}
        footer={
          <Space className="j-r-flex">
            <Button onClick={() => onCancel()}>取 消</Button>
            <Button onClick={() => form.submit()} type="primary">
              确 认
            </Button>
          </Space>
        }
        width={634}
      >
        <div className="float-left mt-24">
          <Form
            form={form}
            name="adminroles-create"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="角色名称"
              name="name"
              rules={[{ required: true, message: "请输入角色名称!" }]}
            >
              <Input
                style={{ width: 424 }}
                placeholder="请在此处输入角色名称"
              />
            </Form.Item>
            <Form.Item label="操作权限" name="action_ids">
              <Select
                style={{ width: 424 }}
                mode="multiple"
                allowClear
                placeholder="请选择权限"
                options={actions}
              />
            </Form.Item>
            <Form.Item label="数据权限" name="permission_ids">
              <Select
                style={{ width: 424 }}
                mode="multiple"
                allowClear
                placeholder="请选择权限"
                options={permissions}
              />
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </>
  );
};

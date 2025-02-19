import React, { useState, useEffect } from "react";
import {
  Typography,
  Input,
  Modal,
  Button,
  Space,
  Table,
  message,
  Image,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
// import styles from "./index.module.less";
import {
  PlusOutlined,
  DownOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { user } from "../../api/index";
import { dateFormat } from "../../utils/index";
import { Link, Navigate, useLocation } from "react-router-dom";
import { TreeDepartment, PerButton } from "../../compenents";
import { MemberCreate } from "./compenents/create";
import { MemberUpdate } from "./compenents/update";
const { confirm } = Modal;

interface DataType {
  id: React.Key;
  name: string;
  email: string;
  created_at: string;
  credit1: number;
  id_card: string;
  is_lock: number;
}

const MemberPage = () => {
  const result = new URLSearchParams(useLocation().search);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [list, setList] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(false);

  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [dep_ids, setDepIds] = useState<any>([]);
  const [selLabel, setLabel] = useState<string>(
    result.get("label") ? String(result.get("label")) : "全部部门"
  );
  const [createVisible, setCreateVisible] = useState<boolean>(false);
  const [updateVisible, setUpdateVisible] = useState<boolean>(false);
  const [mid, setMid] = useState<number>(0);
  const [user_dep_ids, setUserDepIds] = useState<any>({});
  const [departments, setDepartments] = useState<any>({});
  const [did, setDid] = useState(Number(result.get("did")));

  useEffect(() => {
    setDid(Number(result.get("did")));
    if (Number(result.get("did"))) {
      let arr = [];
      arr.push(Number(result.get("did")));
      setDepIds(arr);
    }
  }, [result.get("did")]);

  const columns: ColumnsType<DataType> = [
    {
      title: "学员",
      dataIndex: "name",
      render: (_, record: any) => (
        <>
          <Image
            style={{ borderRadius: "50%" }}
            src={record.avatar}
            preview={false}
            width={40}
            height={40}
          />
          <span className="ml-8">{record.name}</span>
        </>
      ),
    },
    {
      title: "所属部门",
      dataIndex: "id",
      render: (id: number) => (
        <div className="float-left">
          {user_dep_ids[id] &&
            user_dep_ids[id].map((item: any, index: number) => {
              return (
                <span key={index}>
                  {index === user_dep_ids[id].length - 1
                    ? departments[item]
                    : departments[item] + "、"}
                </span>
              );
            })}
        </div>
      ),
    },
    {
      title: "登录邮箱",
      dataIndex: "email",
    },
    {
      title: "加入时间",
      dataIndex: "created_at",
      render: (text: string) => <span>{dateFormat(text)}</span>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 160,
      render: (_, record: any) => {
        const items: MenuProps["items"] = [
          {
            key: "1",
            label: (
              <PerButton
                type="link"
                text="编辑"
                class="b-link c-red"
                icon={null}
                p="user-update"
                onClick={() => {
                  setMid(Number(record.id));
                  setUpdateVisible(true);
                }}
                disabled={null}
              />
            ),
          },
          {
            key: "2",
            label: (
              <PerButton
                type="link"
                text="删除"
                class="b-link c-red"
                icon={null}
                p="user-destroy"
                onClick={() => delUser(record.id)}
                disabled={null}
              />
            ),
          },
        ];

        return (
          <Space size="small">
            <Link
              style={{ textDecoration: "none" }}
              to={`/member/learn?id=${record.id}&name=${record.name}`}
            >
              <PerButton
                type="link"
                text="学习"
                class="b-link c-red"
                icon={null}
                p="user-learn"
                onClick={() => null}
                disabled={null}
              />
            </Link>
            <div className="form-column"></div>
            <Dropdown menu={{ items }}>
              <Button
                type="link"
                className="b-link c-red"
                onClick={(e) => e.preventDefault()}
              >
                <Space size="small" align="center">
                  更多
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, [refresh, page, size, dep_ids]);

  const getData = () => {
    let depIds = dep_ids.join(",");
    setLoading(true);
    user
      .userList(page, size, {
        name: nickname,
        email: email,
        id_card: "",
        dep_ids: depIds,
      })
      .then((res: any) => {
        setList(res.data.data);
        setDepartments(res.data.departments);
        setUserDepIds(res.data.user_dep_ids);
        setTotal(res.data.total);
        setLoading(false);
      });
  };

  const resetData = () => {
    setNickname("");
    setEmail("");
    setPage(1);
    setSize(10);
    setList([]);
    setRefresh(!refresh);
  };

  const paginationProps = {
    current: page, //当前页码
    pageSize: size,
    total: total, // 总条数
    onChange: (page: number, pageSize: number) =>
      handlePageChange(page, pageSize), //改变页码的函数
    showSizeChanger: true,
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setSize(pageSize);
  };

  const delUser = (id: number) => {
    if (id === 0) {
      return;
    }
    confirm({
      title: "操作确认",
      icon: <ExclamationCircleFilled />,
      content: "确认删除此学员？",
      centered: true,
      okText: "确认",
      cancelText: "取消",
      onOk() {
        user.destroyUser(id).then((res: any) => {
          message.success("操作成功");
          setRefresh(!refresh);
        });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  return (
    <>
      <div className="tree-main-body">
        <div className="left-box">
          <TreeDepartment
            selected={dep_ids}
            refresh={refresh}
            showNum={true}
            type=""
            text={"部门"}
            onUpdate={(keys: any, title: any) => {
              setPage(1);
              setDepIds(keys);
              var index = title.indexOf("(");
              if (index !== -1) {
                var resolve = title.substring(0, index);
                setLabel(resolve);
              } else {
                setLabel(title);
              }
            }}
          />
        </div>
        <div className="right-box">
          <div className="playedu-main-title float-left mb-24">
            学员 | {selLabel}
          </div>
          <div className="float-left j-b-flex mb-24">
            <div className="d-flex">
              <PerButton
                type="primary"
                text="添加学员"
                class="mr-16"
                icon={<PlusOutlined />}
                p="user-store"
                onClick={() => setCreateVisible(true)}
                disabled={null}
              />
              {dep_ids.length === 0 && (
                <Link style={{ textDecoration: "none" }} to={`/member/import`}>
                  <PerButton
                    type="default"
                    text="批量导入学员"
                    class="mr-16"
                    icon={null}
                    p="user-store"
                    onClick={() => null}
                    disabled={null}
                  />
                </Link>
              )}
              {dep_ids.length > 0 && (
                <Link
                  style={{ textDecoration: "none" }}
                  to={`/member/departmentUser?id=${dep_ids.join(
                    ","
                  )}&title=${selLabel}`}
                >
                  <PerButton
                    type="default"
                    text="部门学员进度"
                    class="mr-16"
                    icon={null}
                    p="department-user-learn"
                    onClick={() => null}
                    disabled={null}
                  />
                </Link>
              )}
            </div>
            <div className="d-flex">
              <div className="d-flex mr-24">
                <Typography.Text>姓名：</Typography.Text>
                <Input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                  }}
                  style={{ width: 160 }}
                  placeholder="请输入姓名关键字"
                  allowClear
                />
              </div>
              <div className="d-flex mr-24">
                <Typography.Text>邮箱：</Typography.Text>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  style={{ width: 160 }}
                  placeholder="请输入邮箱账号"
                  allowClear
                />
              </div>
              <div className="d-flex">
                <Button className="mr-16" onClick={resetData}>
                  重 置
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setPage(1);
                    setRefresh(!refresh);
                  }}
                >
                  查 询
                </Button>
              </div>
            </div>
          </div>
          <div className="float-left">
            <Table
              columns={columns}
              dataSource={list}
              loading={loading}
              pagination={paginationProps}
              rowKey={(record) => record.id}
            />
            <MemberCreate
              open={createVisible}
              depIds={dep_ids}
              onCancel={() => {
                setCreateVisible(false);
                setRefresh(!refresh);
              }}
            />
            <MemberUpdate
              id={mid}
              open={updateVisible}
              onCancel={() => {
                setUpdateVisible(false);
                setRefresh(!refresh);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberPage;

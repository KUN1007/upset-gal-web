import React from "react";
import { SketchPicker } from "react-color";
import {
  Button,
  Divider,
  Radio,
  RadioChangeEvent,
  Switch,
  Tooltip,
  Upload,
} from "antd";
import dark from "./style/dark.less";
import light from "./style/light.less";
import { storage } from "./config";
import { DirectionType } from "antd/lib/config-provider";
import localforage from "localforage";
import { InboxOutlined } from "@ant-design/icons";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

const { Dragger } = Upload;
export const backgroundImageNode = document.getElementsByClassName(
  "box"
)[0] as HTMLElement;

export function changeBackgroundImage(url: string) {
  if (url === "") {
    console.log("change to no image");
    backgroundImageNode.style.backgroundImage = "none";
  } else if (url === "default") {
    console.log("change to default image");
    if (storage.hasOwnProperty("BGImageURL")) {
      const url = storage.getItem("BGImageURL") as string;
      changeBackgroundImage(window.location.origin + "/pictures/" + url);
    } else {
      if (globalTheme.mobile) {
        changeBackgroundImage(mobileDefaultBackgroundImageURL);
      } else {
        changeBackgroundImage(pcDefaultBackgroundImageURL);
      }
    }
  } else {
    console.log(`change to ${url} image`);
    backgroundImageNode.style.backgroundImage = `url(${url})`;
  }
}

const pcDefaultBackgroundImageURL: string =
  "https://shinnku.com/img-original/img/2020/02/07/19/30/04/79335719_p0.jpg";

const mobileDefaultBackgroundImageURL: string =
  "https://shinnku.com/img-original/img/2021/06/18/19/34/21/90638095_p0.jpg";

type ThemeProviderMenuState = {
  bright: boolean;
  color: {
    primaryColor: string;
    errorColor: string;
    warningColor: string;
    successColor: string;
    infoColor: string;
  };
  hasBGImage: boolean;
};

const defaultColor = {
  primaryColor: "#1890ff",
  errorColor: "#ff4d4f",
  warningColor: "#faad14",
  successColor: "#52c41a",
  infoColor: "#1890ff",
};

export type Theme = {
  mode: "light" | "dark";
  color: {
    primaryColor: string;
    errorColor: string;
    warningColor: string;
    successColor: string;
    infoColor: string;
  };
  backgroundImage?: string;
  mobile: boolean;
  direction?: DirectionType;
  hasBGImage: boolean;
};

export let globalTheme: Theme = {
  mode: "light",
  color: defaultColor,
  mobile: false,
  direction: "ltr",
  hasBGImage: true,
};

const handleSkin = (bright: boolean) => {
  if (bright) {
    console.log("light");
    addSkin(light);
  } else {
    console.log("dark");
    addSkin(dark);
  }
};

function addSkin(content: string) {
  let head = document.getElementsByTagName("head")[0];
  const getStyle = head.getElementsByTagName("style");
  if (getStyle.length > 0) {
    for (let i = 0, l = getStyle.length; i < l; i++) {
      if (getStyle[i].getAttribute("data-type") === "theme") {
        getStyle[i].remove();
      }
    }
  }
  let styleDom = document.createElement("style");
  styleDom.dataset.type = "theme";
  styleDom.innerHTML = content;
  head.appendChild(styleDom);
}

export default function initChangeTheme(): any {
  if (globalTheme.mobile) {
    import("../node_modules/antd/dist/antd.compact.css");
    backgroundImageNode.style.backgroundSize = "cover";
  } else {
    backgroundImageNode.style.backgroundSize = "100%";
  }
  if (globalTheme.mode == "dark") {
    import("../node_modules/antd/dist/antd.dark.css");
  }
  if (globalTheme.hasBGImage) {
    changeBackgroundImage("default");
  }
}

export class ThemeProviderMenu extends React.Component<
  {},
  ThemeProviderMenuState
> {
  constructor(props: {}) {
    super(props);
    if (globalTheme.mode === "light") {
      this.state = {
        bright: true,
        color: defaultColor,
        hasBGImage: globalTheme.hasBGImage,
      };
    } else {
      this.state = {
        bright: false,
        color: defaultColor,
        hasBGImage: globalTheme.hasBGImage,
      };
    }
  }

  onColorChange(nextColor: { primaryColor: string }) {
    const mergedNextColor = {
      ...defaultColor,
      ...nextColor,
    };
    this.setState({ color: mergedNextColor });
    globalTheme.color = mergedNextColor;
  }

  changeDirection = (e: RadioChangeEvent) => {
    const directionValue = e.target.value;
    globalTheme.direction = directionValue;
    storage.setItem("direction", directionValue);
  };

  setBackgroundImage(info: UploadChangeParam<UploadFile>) {
    const { status } = info.file;
    console.log(`status = ${status}`);
    if (status === "done") {
      const res: string = info.file.response;
      storage.setItem("BGImageURL", res);
      console.log(`${info.file.name} file uploaded successfully.`);
      changeBackgroundImage("default")
    } else if (status === "error") {
      console.error(`${info.file.name} file upload failed.`);
    }
  }

  render() {
    return (
      <>
        <p>主题目前正在开发中, 使用起来可能会有bug, 主题会自动保存</p>
        <Divider dashed />
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 16 }}>开关背景按钮</span>
          <Tooltip
            title={`点击${!this.state.hasBGImage ? "打开" : "关闭"}背景图`}
          >
            <Switch
              checkedChildren={<>开</>}
              unCheckedChildren={<>关</>}
              defaultChecked={!this.state.hasBGImage}
              onChange={() => {
                if (this.state.hasBGImage) {
                  globalTheme.hasBGImage = false;
                  storage.setItem("hasBGImage", "false");
                  this.setState({ hasBGImage: false });
                  changeBackgroundImage("");
                } else {
                  globalTheme.hasBGImage = true;
                  storage.setItem("hasBGImage", "true");
                  this.setState({ hasBGImage: true });
                  changeBackgroundImage("default");
                }
              }}
            />
          </Tooltip>
        </div>
        <Divider dashed />
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 16 }}>黑暗/明亮主题切换</span>
          <Tooltip
            title={`点击切换${!this.state.bright ? "明亮" : "暗黑"}主题`}
          >
            <Switch
              checkedChildren={<>🌞</>}
              unCheckedChildren={<>🌜</>}
              defaultChecked={this.state.bright}
              onChange={() => {
                if (this.state.bright) {
                  globalTheme.mode = "dark";
                  storage.setItem("mode", "dark");
                  this.setState({ bright: false });
                  handleSkin(false);
                } else {
                  globalTheme.mode = "light";
                  storage.setItem("mode", "light");
                  this.setState({ bright: true });
                  handleSkin(true);
                }
              }}
            />
          </Tooltip>
        </div>
        <Divider dashed />
        <Dragger
          multiple={false}
          method="post"
          action={window.location.origin + "/upload"}
          onChange={this.setBackgroundImage}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            点击或者拖拽图片到此处以切换背景图片
          </p>
          <p className="ant-upload-hint">
            pc端最好上传横屏图片, 手机最好上传竖屏的哦
          </p>
        </Dragger>
        <Divider dashed />
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 16 }}>
            Change direction of components / 改变方向 / تغيير اتجاه المكونات
          </span>
          <Radio.Group
            defaultValue={globalTheme.direction}
            onChange={this.changeDirection}
          >
            <Radio.Button key="ltr" value="ltr">
              LTR
            </Radio.Button>
            <Radio.Button key="rtl" value="rtl">
              RTL
            </Radio.Button>
          </Radio.Group>
        </div>
        <Divider dashed />
        <Button
          danger
          onClick={() => {
            storage.clear();
            window.location.reload();
          }}
        >
          {" "}
          清除设置(谨慎操作){" "}
        </Button>
        <Divider dashed />
        <div style={{ marginBottom: 16 }}>
          <SketchPicker
            presetColors={["#1890ff", "#25b864", "#ff6f00"]}
            color={this.state.color.primaryColor}
            onChange={({ hex }: any) => {
              this.onColorChange({
                primaryColor: hex,
              });
            }}
          />
          <span style={{ color: "var(--ant-primary-color)", marginRight: 16 }}>
            网站色调
          </span>
        </div>
        <Divider dashed />
      </>
    );
  }
}

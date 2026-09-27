import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotificationWidget from "../NotificationWidget.vue";
import type { AutomotiveNotification } from "../../../../domain/notification/types";

describe("NotificationWidget", () => {
  const sampleNotifications: AutomotiveNotification[] = [
    {
      id: "notif-1",
      app: "WhatsApp",
      sender: "Alice",
      message: "Hey, see you at 5!",
      time: "14:30",
      category: "message",
    },
    {
      id: "notif-2",
      app: "Maps",
      sender: "Navigation",
      message: "Turn right in 200m",
      time: "14:32",
      category: "navigation",
    },
  ];

  it("renders empty state when there are no notifications", () => {
    const wrapper = mount(NotificationWidget, {
      props: { notifications: [] },
    });

    expect(wrapper.text()).toContain("No Notifications");
    expect(wrapper.text()).toContain("Cockpit quiet & focused");
    expect(wrapper.find(".sim-test-btn").exists()).toBe(true);
  });

  it("emits simulate event when test button clicked in empty state", async () => {
    const wrapper = mount(NotificationWidget, {
      props: { notifications: [] },
    });

    await wrapper.find(".sim-test-btn").trigger("click");
    expect(wrapper.emitted("simulate")).toHaveLength(1);
  });

  it("renders notification items when notifications exist", () => {
    const wrapper = mount(NotificationWidget, {
      props: { notifications: sampleNotifications },
    });

    expect(wrapper.text()).toContain("2 Messages");
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("Hey, see you at 5!");
    expect(wrapper.text()).toContain("Navigation");
    expect(wrapper.text()).toContain("Turn right in 200m");
  });

  it("emits dismiss with notification id when dismiss button clicked", async () => {
    const wrapper = mount(NotificationWidget, {
      props: { notifications: sampleNotifications },
    });

    const dismissBtns = wrapper.findAll(".notif-dismiss-btn");
    await dismissBtns[0].trigger("click");

    expect(wrapper.emitted("dismiss")?.[0]).toEqual(["notif-1"]);
  });

  it("emits clearAll when Clear All is clicked", async () => {
    const wrapper = mount(NotificationWidget, {
      props: { notifications: sampleNotifications },
    });

    await wrapper.find(".notif-clear-all").trigger("click");
    expect(wrapper.emitted("clearAll")).toHaveLength(1);
  });
});

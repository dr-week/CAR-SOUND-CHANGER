import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SidebarDock from "../SidebarDock.vue";

describe("SidebarDock UI Component", () => {
  it("renders brand button and navigation rail items with active states", async () => {
    const wrapper = mount(SidebarDock, {
      props: { currentView: "home" },
    });

    const brandBtn = wrapper.find(".brand");
    expect(brandBtn.exists()).toBe(true);
    expect(brandBtn.classes()).toContain("active");

    const buttons = wrapper.findAll(".rail-button");
    // 4 nav items (Media, Navigate, Apps, Companion) + 1 settings link = 5 rail-buttons
    expect(buttons.length).toBe(5);

    // Click Media
    await buttons[0].trigger("click");
    expect(wrapper.emitted("update:currentView")?.[0]).toEqual(["media"]);

    // Click Companion Link
    await buttons[3].trigger("click");
    expect(wrapper.emitted("update:currentView")?.[1]).toEqual(["connect"]);

    // Click Settings
    const settingsBtn = wrapper.find(".settings-link");
    expect(settingsBtn.exists()).toBe(true);
    await settingsBtn.trigger("click");
    expect(wrapper.emitted("update:currentView")?.[2]).toEqual(["settings"]);
  });

  it("highlights the currently active view tab", () => {
    const wrapper = mount(SidebarDock, {
      props: { currentView: "media" },
    });

    const activeBtn = wrapper.find(".rail-button.active");
    expect(activeBtn.exists()).toBe(true);
    expect(activeBtn.text()).toContain("Media");
  });
});

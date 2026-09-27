import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ConnectView from '../ConnectView.vue';

describe('ConnectView', () => {
  it('renders broadcaster link header and tabs', () => {
    const wrapper = mount(ConnectView, {
      props: {
        bridgeConnected: false,
        phoneTelemetry: null,
      },
    });

    expect(wrapper.text()).toContain('Broadcaster Link');
    expect(wrapper.text()).toContain('Ready to Pair');
    expect(wrapper.text()).toContain('QR Code');
    expect(wrapper.text()).toContain('Ultrasonic');
    expect(wrapper.text()).toContain('Auto-Discovery');
    expect(wrapper.text()).toContain('Direct IP');
  });

  it('switches to Ultrasonic tab and emits sonicPair event', async () => {
    const wrapper = mount(ConnectView, {
      props: { bridgeConnected: true },
    });

    const tabs = wrapper.findAll('.connect-tab-btn');
    expect(tabs.length).toBe(4);

    // Switch to Ultrasonic tab
    await tabs[1].trigger('click');
    expect(wrapper.text()).toContain('Ultrasonic Acoustic Chirp');

    const chirpBtn = wrapper.find('.connect-action-btn');
    expect(chirpBtn.exists()).toBe(true);
    await chirpBtn.trigger('click');

    expect(wrapper.emitted('sonicPair')).toHaveLength(1);
  });

  it('displays connected phone telemetry when available', () => {
    const wrapper = mount(ConnectView, {
      props: {
        bridgeConnected: true,
        phoneTelemetry: {
          phoneName: 'Pixel 9 Pro',
          battery: 88,
          charging: true,
          network: '5G Fast',
        },
      },
    });

    expect(wrapper.text()).toContain('Pixel 9 Pro');
    expect(wrapper.text()).toContain('88%');
    expect(wrapper.text()).toContain('5G Fast');
  });
});

import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import NavigateView from '../NavigateView.vue';

describe('NavigateView', () => {
  it('renders Google Maps HUD, search box, and quick pills', () => {
    const wrapper = mount(NavigateView, {
      props: {
        destinationQuery: 'Central Park',
      },
    });

    expect(wrapper.text()).toContain('GOOGLE MAPS');
    expect(wrapper.text()).toContain('Fuel / EV');
    expect(wrapper.text()).toContain('Parking');
    expect(wrapper.text()).toContain('Coffee');
    expect(wrapper.text()).toContain('Start Navigation in Google Maps');
  });

  it('emits navigate when selecting quick category pill', async () => {
    const wrapper = mount(NavigateView, {
      props: {
        destinationQuery: '',
      },
    });

    const pills = wrapper.findAll('.nav-cat-pill');
    expect(pills.length).toBe(3);

    await pills[0].trigger('click');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['Petrol Pump / EV Charger']);
  });

  it('emits navigate when clicking Start Navigation in Google Maps', async () => {
    const wrapper = mount(NavigateView, {
      props: {
        destinationQuery: 'Airport Terminal 3',
      },
    });

    const startBtn = wrapper.find('.nav-start-btn');
    expect(startBtn.exists()).toBe(true);

    await startBtn.trigger('click');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['Airport Terminal 3']);
  });
});

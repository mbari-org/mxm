import { mount } from '@vue/test-utils'
import MxmMarkdownView from '../mxm-markdown-view'

describe('MxmMarkdownView', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(MxmMarkdownView)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  test('renders correctly', () => {
    const wrapper = mount(MxmMarkdownView)
    expect(wrapper.element).toMatchSnapshot()
  })
})

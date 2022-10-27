/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"
jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  document.body.innerHTML = BillsUI({ data: bills })
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
});
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    it("Should highlight the bill icon in vertical layout", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    fit("Should fetche bills from mock API GET", async () => {
      expect(screen.getAllByTestId("rowBill")).toBeTruthy()
    })
    it("Should be ordered the bills from earliest to latest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    it('Should open the image modal when I click on eye icon', () => {
      window.onNavigate(ROUTES_PATH.Bills)
      const store = null
      const billsContainer = new Bills({ document, onNavigate, store, localStorage })
      const handleClickIconEye = jest.spyOn(billsContainer, "handleClickIconEye")
      const eye = screen.getAllByTestId('icon-eye')[0]
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalledWith(eye)
      let modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
    it('Should redirect on newBill when I click on "nouvelle note de frais', () => {
      window.onNavigate(ROUTES_PATH.Bills)
      const store = null
      const billsContainer = new Bills({ document, onNavigate, store, localStorage })
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy()
      expect(location.hash).toEqual(ROUTES_PATH.NewBill)
    })
  })
  describe('When I am on Bills page but it is loading', () => {
    it('Should render the loading page', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message 404', () => {
    it('Should render the error page', () => {
      document.body.innerHTML = BillsUI({ error: 'Erreur 404' })
      expect(screen.getAllByText('Erreur 404')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message 500', () => {
    it('Should render the error page', () => {
      document.body.innerHTML = BillsUI({ error: 'Erreur 500' })
      expect(screen.getAllByText('Erreur 500')).toBeTruthy()
    })
  })
 
})

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
      // const handleClickIconEye = jest.fn((e) => billsContainer.handleClickIconEye)
      const handleClickIconEye = jest.spyOn(billsContainer, "handleClickIconEye")
      //screen.getAllByTestId('icon-eye').every((eye) => eye.addEventListener('click', handleClickIconEye))
      const eye = screen.getAllByTestId('icon-eye')[0]
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalledWith(eye)
      let modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })
    it('Should redirect on bill/new when I click on "nouvelle note de frais', () => {
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
  describe('When I am on Bills page but back-end send an error message', () => {
    it('Should render the error page', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      document.body.innerHTML = BillsUI({ data: bills })
      jest.spyOn(mockStore, "bills")
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    it("Should not fetch bills from an API and fail with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    it("Should not fetch bills from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

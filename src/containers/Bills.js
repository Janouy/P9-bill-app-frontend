import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    const iconDownload = document.querySelectorAll(`div[data-testid="icon-download"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    if (iconDownload) iconDownload.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconDownload(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billName = icon.getAttribute("data-bill-name")
    const billUrl = icon.getAttribute("data-bill-url")
    if(billName !== "null"){
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width="100%" src=${billUrl} alt="Bill" /></div>`)
      $('#modaleFile').modal('show')
    }else{
      alert("Format d'image incorrect")
    }
  }
 
  handleClickIconDownload = (icon) => {
    const billName = icon.getAttribute("data-bill-name")
    const billUrl = icon.getAttribute("data-bill-url")
    if(billName !== "null"){
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" />`)
    let imageToDownload = document.querySelector('.bill-proof-container img')
    const doc = new jsPDF()
    doc.addImage(imageToDownload, 10, 10, 200, 300)
    doc.save(`${billName}.pdf`)
    }else{
      alert("Format d'image incorrect")
    }
  }

  //ajout fonction de tri décroissant
  sortBillByDate = (a, b) => {
    return new Date(b.date) - new Date(a.date)
  }
  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot.sort(this.sortBillByDate)
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}

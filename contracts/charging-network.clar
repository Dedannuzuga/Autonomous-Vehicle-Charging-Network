;; Charging Network Smart Contract

;; Define data vars
(define-data-var network-fee uint u100) ;; 1% fee
(define-map charging-stations
  { station-id: uint }
  { owner: principal, price: uint, available: bool })
(define-map reservations
  { station-id: uint }
  { user: principal, start-time: uint, end-time: uint })

;; Define functions
(define-public (register-station (station-id uint) (price uint))
  (let ((caller tx-sender))
    (map-insert charging-stations
      { station-id: station-id }
      { owner: caller, price: price, available: true })
    (ok true)))

(define-public (update-station-price (station-id uint) (new-price uint))
  (let ((station (unwrap! (map-get? charging-stations { station-id: station-id }) (err u404)))
        (caller tx-sender))
    (asserts! (is-eq (get owner station) caller) (err u403))
    (map-set charging-stations
      { station-id: station-id }
      (merge station { price: new-price }))
    (ok true)))

(define-public (set-station-availability (station-id uint) (is-available bool))
  (let ((station (unwrap! (map-get? charging-stations { station-id: station-id }) (err u404)))
        (caller tx-sender))
    (asserts! (is-eq (get owner station) caller) (err u403))
    (map-set charging-stations
      { station-id: station-id }
      (merge station { available: is-available }))
    (ok true)))

(define-public (make-reservation (station-id uint) (start-time uint) (end-time uint))
  (let ((station (unwrap! (map-get? charging-stations { station-id: station-id }) (err u404)))
        (caller tx-sender))
    (asserts! (get available station) (err u400))
    (map-set reservations
      { station-id: station-id }
      { user: caller, start-time: start-time, end-time: end-time })
    (map-set charging-stations
      { station-id: station-id }
      (merge station { available: false }))
    (ok true)))

(define-public (complete-charging (station-id uint))
  (let ((station (unwrap! (map-get? charging-stations { station-id: station-id }) (err u404)))
        (reservation (unwrap! (map-get? reservations { station-id: station-id }) (err u404)))
        (caller tx-sender)
        (owner (get owner station))
        (price (get price station))
        (fee (/ (* price (var-get network-fee)) u10000)))
    (asserts! (is-eq caller (get user reservation)) (err u403))
    (try! (stx-transfer? price caller owner))
    (try! (stx-transfer? fee owner (as-contract tx-sender)))
    (map-delete reservations { station-id: station-id })
    (map-set charging-stations
      { station-id: station-id }
      (merge station { available: true }))
    (ok true)))

(define-read-only (get-station-info (station-id uint))
  (map-get? charging-stations { station-id: station-id }))

(define-read-only (get-reservation-info (station-id uint))
  (map-get? reservations { station-id: station-id }))

# Pixelz Portal

Pixel Portal is the front-end for the portal payment app. User can create order

## Setup the project
- Clone from the repo
- Run the following command in bash to setup kafka connection

```
node bridge.js
```
- Run `ng serve` to run the project.

## Create Orders

- IT Supports and Managers can create order, set the charge amount, and assign the order to a specific user.

- Normal User can create order, but the charge amount is empty and must be set by IT Support/Manager

1. Add Notes
- Notes served as a place for user to add their instructions, relevant files so our studio can understand what's going on.
- User can upload Image, PDF, Word Document.


## Pay for the Order

- IT Supports and Manager can:
  - Pay for the order using payment method. This should follow the same process as checking out order.
  - Mark order as Paid. This is used in case order is paid via Wire Transfer.

## Order List
- Users can filter all the orders by name, status, etc.

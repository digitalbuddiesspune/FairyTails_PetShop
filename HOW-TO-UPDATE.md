# How to Add Collar and Leash Options

## Simple Steps:

### Step 1: Make sure your backend server is running
1. Open a terminal
2. Go to the `backend` folder: `cd backend`
3. Start the server: `npm start`
4. Wait until you see "Server running on port 5000"

### Step 2: Update the database
You have 2 options:

**Option A: Run the script (Easiest)**
1. Open a NEW terminal (keep the backend running)
2. In the project root folder, run:
   ```
   node update-categories.js
   ```

**Option B: Use Postman or Browser**
1. Open Postman (or any API tool)
2. Make a POST request to: `http://localhost:5000/api/categories/seed`
3. Click Send

### Step 3: Refresh your frontend
1. Go to your website
2. Press F5 or refresh the page
3. Click on "Dogs" in the menu
4. You should now see "Collar" and "Leash" options!

---

**That's it!** After these steps, the Collar and Leash options will appear in the Dogs dropdown menu.

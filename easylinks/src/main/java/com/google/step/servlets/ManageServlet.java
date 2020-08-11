package com.google.step.servlets;

import com.google.step.servlets.ServletHelper;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Entity;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for managing links. */
@WebServlet("/~manage")
public class ManageServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    final String email = ServletHelper.USERSERVICE.isUserLoggedIn() ?
        ServletHelper.USERSERVICE.getCurrentUser().getEmail() : null;
    // Define a query rule that retreives records based on email and 
    // sorts links in alphabetically by shortcut
    if (email == null) return;
    Filter emailFilter =
        new FilterPredicate("email", FilterOperator.EQUAL, email);
    Query query = new Query("Link")
                      .setFilter(emailFilter)
                      .addSort("shortcut", SortDirection.ASCENDING);
    PreparedQuery results = ServletHelper.DEFAULT_DATASTORE_SERVICE.prepare(query);

    response.setContentType("application/json;");
    response.getWriter().println(ServletHelper.convertToJson(
        results.asList(FetchOptions.Builder.withDefaults())));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String action = ServletHelper.getParameterWithDefault(request, "action", "");
    switch (action)
    {
      case "add":
        addLink(request, response);
        break;
      case "delete":
        deleteLink(request, response);
        break;
      case "edit":
        editLink(request, response);
        break;
      case "go-public":
        goPublic(request, response);
        break;
      default:
        break;
    }
  }

  private static void addLink(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Check the input strings are valid
    String shortcut = ServletHelper.getParameterWithDefault(request, "shortcut", "");
    String url = ServletHelper.getParameterWithDefault(request, "url", "");
    if (shortcut.isEmpty() || shortcut.startsWith(PROVIDED_LINK) || url.isEmpty()) {
      response.getWriter().println("Invalid Input.");
      return;
    }

    // Check if the shortcut already created in the DataStore
    String email = ServletHelper.USERSERVICE.getCurrentUser().getEmail();
    if (ServletHelper.fetchUrlWithDefault(shortcut, email, null) != null) {
      // The shorcut already exists
      response.getWriter().println("Repeated shortcut.");
      return;
    }

    // Add the mapping to the DataStore
    Entity easyLinkEntity = new Entity("Link");
    easyLinkEntity.setProperty("shortcut", shortcut);
    easyLinkEntity.setProperty("url", url);
    easyLinkEntity.setProperty("email", email);

    ServletHelper.DEFAULT_DATASTORE_SERVICE.put(easyLinkEntity);
    response.sendRedirect("/manage.html");
  }

  private static void editLink(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("ed-id"));
    String shortcut = ServletHelper.getParameterWithDefault(request, "ed-shortcut", "");
    String url = ServletHelper.getParameterWithDefault(request, "ed-url", "");
    if (shortcut.isEmpty() || shortcut.startsWith(PROVIDED_LINK) || url.isEmpty()) {
      response.getWriter().println("Invalid Input.");
      return;
    }

    try {
      // Overwrite existing entity property
      Key linkEntityKey = KeyFactory.createKey("Link", id);
      Entity easyLinkEntity = ServletHelper.DEFAULT_DATASTORE_SERVICE.get(linkEntityKey);
      easyLinkEntity.setProperty("shortcut", shortcut);
      easyLinkEntity.setProperty("url", url);
      ServletHelper.DEFAULT_DATASTORE_SERVICE.put(easyLinkEntity);
    } catch(Exception e) {
      response.getWriter().println("Invalid ID.");
    }
    response.sendRedirect("/manage.html");
  }

  private static void deleteLink(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key linkEntityKey = KeyFactory.createKey("Link", id);
    ServletHelper.DEFAULT_DATASTORE_SERVICE.delete(linkEntityKey);
  }

  private static void goPublic(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key linkEntityKey = KeyFactory.createKey("Link", id);
    try {
      Entity easyLinkEntity = ServletHelper.DEFAULT_DATASTORE_SERVICE.get(linkEntityKey);
      String shortcut = "~" + (String) easyLinkEntity.getProperty("shortcut");
      
      // Check if the shortcut already created in the DataStore
      if (ServletHelper.fetchUrlWithDefault(shortcut, ServletHelper.ADMIN, null) != null) {
        // The shorcut already exists
        response.getWriter().println("Repeated shortcut.");
        return;
      }
      easyLinkEntity.setProperty("shortcut", shortcut);
      easyLinkEntity.setProperty("email", ServletHelper.ADMIN);
      easyLinkEntity.setProperty("creator", ServletHelper.USERSERVICE.getCurrentUser().getEmail());
      ServletHelper.DEFAULT_DATASTORE_SERVICE.put(easyLinkEntity);
    } catch(Exception e) {
      response.getWriter().println("Invalid ID.");
    }
    response.sendRedirect("/manage.html");
  }

    private static final String PROVIDED_LINK = "~";
}
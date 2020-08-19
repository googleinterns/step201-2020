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

  /** Returns the private links created by the user */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    final String email = ServletHelper.USERSERVICE.isUserLoggedIn() ?
        ServletHelper.USERSERVICE.getCurrentUser().getEmail() : null;
    // Define a query rule that retreives records based on email and 
    // sorts links in alphabetically by shortcut
    if (email == null) return;
    Filter emailFilter =
        new FilterPredicate("creator", FilterOperator.EQUAL, email);
    Query query = new Query("Link")
                      .setFilter(emailFilter)
                      .addSort("shortcut", SortDirection.ASCENDING);
    PreparedQuery results = ServletHelper.DEFAULT_DATASTORE_SERVICE.prepare(query);

    response.setContentType("application/json;");
    response.getWriter().println(ServletHelper.convertToJson(
        results.asList(FetchOptions.Builder.withDefaults())));
  }

  /** Manages the links in the DataStore*/
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
      case "go-private":
        goPrivate(request, response);
      default:
        break;
    }
  }

  /** Adds the link and its corresponding url to the DataStore */
  private static void addLink(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Check the input strings are valid and if the shortcut already created in the DataStore
    String shortcut = ServletHelper.getParameterWithDefault(request, "shortcut", "");
    String url = ServletHelper.getParameterWithDefault(request, "url", "");
    String email = ServletHelper.USERSERVICE.getCurrentUser().getEmail();
    if (shortcut.isEmpty() || shortcut.startsWith(PROVIDED_LINK) || url.isEmpty() ||
        ServletHelper.fetchUrlWithDefault(shortcut, email, null) != null) {
      ServletHelper.showErrorMsg(CHANGE_LINK_ERROR, MANAGE_PAGE, response.getWriter());
      return;
    }

    // Add the mapping to the DataStore
    Entity easyLinkEntity = new Entity("Link");
    easyLinkEntity.setProperty("status", "Private");
    easyLinkEntity.setProperty("shortcut", shortcut);
    easyLinkEntity.setProperty("url", url);
    easyLinkEntity.setProperty("creator", email);
    easyLinkEntity.setProperty("email", email);

    ServletHelper.DEFAULT_DATASTORE_SERVICE.put(easyLinkEntity);
    response.sendRedirect("/manage.html");
  }

  /** Edits the existing link in the DataStore */
  private static void editLink(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("ed-id"));
    String shortcut = ServletHelper.getParameterWithDefault(request, "ed-shortcut", "");
    String url = ServletHelper.getParameterWithDefault(request, "ed-url", "");
    String email = ServletHelper.USERSERVICE.getCurrentUser().getEmail();

    // Check if the shortcut/url is qualified
    if (shortcut.isEmpty() || shortcut.startsWith(PROVIDED_LINK) || url.isEmpty() ||
        ServletHelper.fetchUrlWithDefault(shortcut, email, null) != null ||
        ServletHelper.fetchUrlWithDefault(shortcut, ServletHelper.ADMIN, null) != null) {
      ServletHelper.showErrorMsg(CHANGE_LINK_ERROR, MANAGE_PAGE, response.getWriter());
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

  /** Deletes the link from DataStore */
  private static void deleteLink(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key linkEntityKey = KeyFactory.createKey("Link", id);
    ServletHelper.DEFAULT_DATASTORE_SERVICE.delete(linkEntityKey);
  }

  /** Makes a personal link to public so that everyone can view and use it */
  private static void goPublic(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key linkEntityKey = KeyFactory.createKey("Link", id);
    try {
      Entity easyLinkEntity = ServletHelper.DEFAULT_DATASTORE_SERVICE.get(linkEntityKey);
      String shortcut = (String) easyLinkEntity.getProperty("shortcut");
      
      // Check if the shortcut already created in the DataStore
      if (ServletHelper.fetchUrlWithDefault(shortcut, ServletHelper.ADMIN, null) != null) {
        // The shorcut already exists
        response.getWriter().println("Repeated shortcut.");
        return;
      }
      easyLinkEntity.setProperty("status", "Public");
      easyLinkEntity.setProperty("email", ServletHelper.ADMIN);
      ServletHelper.DEFAULT_DATASTORE_SERVICE.put(easyLinkEntity);
    } catch(Exception e) {
      response.getWriter().println("Invalid ID.");
    }
    response.sendRedirect("/manage.html");
  }

  /** Makes a public link to a private link that can only be used by the creator */
  private static void goPrivate(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key linkEntityKey = KeyFactory.createKey("Link", id);
    try {
      Entity easyLinkEntity = ServletHelper.DEFAULT_DATASTORE_SERVICE.get(linkEntityKey);
      String shortcut = (String) easyLinkEntity.getProperty("shortcut");
      String creator = (String) easyLinkEntity.getProperty("creator");

      // Check if the user is the creator of the public link
      if (!creator.equals((String) ServletHelper.USERSERVICE.getCurrentUser().getEmail())) {
        response.getWriter().println("Wrong user.");
        return;
      }

      if (ServletHelper.fetchUrlWithDefault(shortcut, 
              (String) easyLinkEntity.getProperty("creator"), null) != null) {
        // The shorcut already exists
        response.getWriter().println("Repeated shortcut.");
        return;
      }
      
      easyLinkEntity.setProperty("status", "Private");
      easyLinkEntity.setProperty("email", (String) easyLinkEntity.getProperty("creator"));
      ServletHelper.DEFAULT_DATASTORE_SERVICE.put(easyLinkEntity);
    } catch(Exception e) {
      response.getWriter().println("Invalid ID.");
    }
    response.sendRedirect("/manage.html");
  }

    private static final String PROVIDED_LINK = "~";
    private static final String MANAGE_PAGE = "manage.html";
    private static final String CHANGE_LINK_ERROR = "Process Failed. The reasons may be: \\n"
                                    + "The shortcut is an empty string.\\n"
                                    + "The shortcut starts with '~'.\\n"
                                    + "The shortcut already exists.\\n"
                                    + "The URL is an empty string.";
    private static final String WRONG_USER_ERROR = "Only the creator can make this change.";
}
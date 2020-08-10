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

/** Servlet responsible for displaying the existing public links */
@WebServlet("/diplay-public-link")
public class PublicLinkServlet extends HttpServlet {

  /** Responses the given number of public links starting after the given offset */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Fetch the offset and the max number of links to show
    int offset = Integer.parseInt(
        ServletHelper.getParameterWithDefault(request, "offset", DEFAULT_OFFSET));
    int numLinksToShow = Integer.parseInt(
        ServletHelper.getParameterWithDefault(request, "numLinksToShow", DEFAULT_LINKS_TO_SHOW));

    // Retrieve the links from the datastore
    Query query = new Query("Link").setFilter(
                    new FilterPredicate("email", FilterOperator.EQUAL, ServletHelper.ADMIN))
                    .addSort("shortcut", SortDirection.ASCENDING);
    PreparedQuery results = ServletHelper.DEFAULT_DATASTORE_SERVICE.prepare(query);
    // Response with links
    response.setContentType("application/json");
    response.getWriter().println(ServletHelper.convertToJson(
        results.asList(FetchOptions.Builder.withDefaults().offset(offset).limit(numLinksToShow))));
  }

  private static final String DEFAULT_OFFSET = "0";
  private static final String DEFAULT_LINKS_TO_SHOW = "20";
}